import { createRequire } from 'node:module';
import path from 'node:path';

import {
  defaultComponentsRoot,
  defaultOwaRoot,
  emitJson,
  parseArgs,
  resolveFromCwd,
  usageError,
} from '../lib/cli.js';
import { codeUnitCompare } from '../lib/compare.js';
import { assertRepository, resolvePackage } from '../lib/repository.js';
import {
  isProductionFile,
  normaliseRelative,
  readSources,
  sourceFiles,
} from '../lib/source-files.js';

import type {
  CompilerOptions,
  Diagnostic,
  DiagnosticMessageChain,
  ImportDeclaration,
  NamedImports,
  NamespaceImport,
  Node,
  ParseConfigHost,
  ParsedCommandLine,
  Program,
  ScriptKind,
  ScriptTarget,
  SourceFile,
  StringLiteralLike,
  SymbolFlags,
  System,
} from 'typescript';

interface TypeScriptModule {
  sys: System;
  ScriptTarget: { Latest: ScriptTarget };
  ScriptKind: { TSX: ScriptKind; TS: ScriptKind };
  SymbolFlags: { Alias: SymbolFlags };
  isImportDeclaration(node: Node): node is ImportDeclaration;
  isStringLiteralLike(node: Node): node is StringLiteralLike;
  isNamedImports(node: Node): node is NamedImports;
  isNamespaceImport(node: Node): node is NamespaceImport;
  readConfigFile(
    fileName: string,
    readFile: (path: string) => string | undefined,
  ): { config?: unknown; error?: Diagnostic };
  flattenDiagnosticMessageText(
    diag: string | DiagnosticMessageChain | undefined,
    newLine: string,
    indent?: number,
  ): string;
  parseJsonConfigFileContent(
    json: unknown,
    host: ParseConfigHost,
    basePath: string,
  ): ParsedCommandLine;
  createProgram(rootNames: readonly string[], options: CompilerOptions): Program;
  createSourceFile(
    fileName: string,
    sourceText: string,
    languageVersion: ScriptTarget,
    setParentNodes?: boolean,
    scriptKind?: ScriptKind,
  ): SourceFile;
}

type ImportWithStringSpecifier = ImportDeclaration & {
  moduleSpecifier: StringLiteralLike;
};

interface PublicExport {
  name: string;
  declarationPath: string;
  category: string;
}

interface CategoryStat {
  publicNames: number;
  namesImportedDirectlyByOwa: number;
  directImportAppearances: number;
}

const usage = `Usage: pnpm exec tsx scripts/component-boundary-inventory.ts [options]

Options:
  --owa <path>         OWA checkout (default: sibling Oak-Web-Application)
  --components <path>  Oak Components checkout (default: sibling oak-components)
  --output <path>      Write JSON to this path instead of stdout`;

const args = parseArgs(process.argv.slice(2), [], ['owa', 'components', 'output']);
const owaRoot = resolveFromCwd(typeof args.owa === 'string' ? args.owa : undefined, defaultOwaRoot);
const componentsRoot = resolveFromCwd(
  typeof args.components === 'string' ? args.components : undefined,
  defaultComponentsRoot,
);

const DIRECT_PACKAGE = '@oaknational/oak-components';
const OWA_THEME_REEXPORT = '@/styles/oakThemeApp';

function isTypeScriptModule(value: unknown): value is TypeScriptModule {
  return typeof value === 'object' && value !== null;
}

function importDeclarations(
  ts: TypeScriptModule,
  sourceFile: SourceFile,
): ImportWithStringSpecifier[] {
  return sourceFile.statements.filter(
    (statement): statement is ImportWithStringSpecifier =>
      ts.isImportDeclaration(statement) && ts.isStringLiteralLike(statement.moduleSpecifier),
  );
}

function importNames(ts: TypeScriptModule, declaration: ImportDeclaration): string[] {
  const clause = declaration.importClause;
  if (!clause) {
    return [];
  }

  const names: string[] = [];
  if (clause.name) {
    names.push('default');
  }
  const bindings = clause.namedBindings;
  if (bindings && ts.isNamedImports(bindings)) {
    for (const element of bindings.elements) {
      names.push((element.propertyName ?? element.name).text);
    }
  } else if (bindings && ts.isNamespaceImport(bindings)) {
    names.push('*');
  }
  return names;
}

function hasSharedComponentsImport(specifier: string): boolean {
  return (
    specifier.startsWith('@/components/SharedComponents') ||
    specifier.includes('/components/SharedComponents')
  );
}

function categoryFor(relativeDeclarationPath: string, exportName: string): string {
  if (relativeDeclarationPath.startsWith('src/test-helpers/')) {
    return 'testSupport';
  }
  if (relativeDeclarationPath.startsWith('src/hooks/')) {
    return 'hooks';
  }

  const adapters = new Set([
    'OakCloudinaryImage',
    'OakCloudinaryImageProps',
    'OakCloudinaryConfigProvider',
    'OakImage',
    'OakImageProps',
    'oakPlaceholder',
    'placeholderStyles',
    'OakPrimaryNavItem',
    'OakPrimaryNavItemProps',
    'OakTabs',
    'OakTabsProps',
  ]);
  if (adapters.has(exportName)) {
    return 'adapters';
  }
  if (relativeDeclarationPath.startsWith('src/components/owa/')) {
    return 'recipes';
  }

  if (relativeDeclarationPath.startsWith('src/styles/')) {
    return 'foundations';
  }
  if (
    relativeDeclarationPath.startsWith('src/components/layout-and-structure/') ||
    relativeDeclarationPath.startsWith('src/components/typography/') ||
    relativeDeclarationPath.startsWith('src/components/unstyled/') ||
    relativeDeclarationPath.startsWith('src/components/OakThemeProvider/') ||
    relativeDeclarationPath.startsWith('src/components/OakGlobalStyle/')
  ) {
    return 'primitives';
  }
  return 'controls';
}

async function main(): Promise<void> {
  const [owa, components] = await Promise.all([
    assertRepository(owaRoot, 'oak-web-application'),
    assertRepository(componentsRoot, '@oaknational/oak-components'),
  ]);

  const requireFromComponents = createRequire(path.join(componentsRoot, 'package.json'));
  const typescriptPath = await resolvePackage(requireFromComponents, 'typescript');
  const compiler: unknown = requireFromComponents(typescriptPath);
  if (!isTypeScriptModule(compiler)) {
    throw new Error('Could not load the TypeScript compiler');
  }
  const ts = compiler;

  const configPath = path.join(componentsRoot, 'tsconfig.json');
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'));
  }
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, componentsRoot);
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const checker = program.getTypeChecker();
  const indexPath = path.join(componentsRoot, 'src/index.ts');
  const indexSource = program.getSourceFile(indexPath);
  const moduleSymbol = indexSource && checker.getSymbolAtLocation(indexSource);
  if (!indexSource || !moduleSymbol) {
    throw new Error('Could not resolve Components root module');
  }

  const publicExports = checker
    .getExportsOfModule(moduleSymbol)
    .map((symbol) => {
      const target =
        (symbol.flags & ts.SymbolFlags.Alias) !== 0 ? checker.getAliasedSymbol(symbol) : symbol;
      const declaration = target.declarations?.[0] ?? symbol.declarations?.[0];
      const declarationPath = declaration
        ? normaliseRelative(componentsRoot, declaration.getSourceFile().fileName)
        : 'unknown';
      return {
        name: symbol.getName(),
        declarationPath,
        category: categoryFor(declarationPath, symbol.getName()),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));

  const componentSourceRoot = path.join(componentsRoot, 'src');
  const owaSourceRoot = path.join(owaRoot, 'src');
  const [componentFiles, allOwaFiles] = await Promise.all([
    sourceFiles(componentSourceRoot),
    sourceFiles(owaSourceRoot),
  ]);
  const productionComponentFiles = componentFiles.filter((file) =>
    isProductionFile(file, componentSourceRoot),
  );
  const productionOwaFiles = allOwaFiles.filter((file) => isProductionFile(file, owaSourceRoot));
  const [componentSources, owaSources] = await Promise.all([
    readSources(productionComponentFiles),
    readSources(productionOwaFiles),
  ]);

  const directConsumerFiles = new Set<string>();
  const themeConsumerFiles = new Set<string>();
  const sharedConsumerFiles = new Set<string>();
  const directNameAppearances = new Map<string, number>();

  for (const source of owaSources) {
    const sourceFile = ts.createSourceFile(
      source.file,
      source.text,
      ts.ScriptTarget.Latest,
      true,
      source.file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    for (const declaration of importDeclarations(ts, sourceFile)) {
      const specifier = declaration.moduleSpecifier.text;
      if (specifier === DIRECT_PACKAGE) {
        directConsumerFiles.add(source.file);
        for (const name of new Set(importNames(ts, declaration))) {
          directNameAppearances.set(name, (directNameAppearances.get(name) ?? 0) + 1);
        }
      }
      if (specifier === OWA_THEME_REEXPORT) {
        themeConsumerFiles.add(source.file);
      }
      if (hasSharedComponentsImport(specifier)) {
        sharedConsumerFiles.add(source.file);
      }
    }
  }

  const oakConsumerFiles = new Set([...directConsumerFiles, ...themeConsumerFiles]);
  const overlap = new Set([...oakConsumerFiles].filter((file) => sharedConsumerFiles.has(file)));
  const localSharedImplementations = new Set(
    [...directConsumerFiles].filter((file) =>
      normaliseRelative(owaSourceRoot, file).startsWith('components/SharedComponents/'),
    ),
  );

  const exportByName = new Map(
    publicExports.map((item): [string, PublicExport] => [item.name, item]),
  );
  const categoryOrder = [
    'foundations',
    'primitives',
    'controls',
    'adapters',
    'recipes',
    'hooks',
    'testSupport',
  ];
  const categories = Object.fromEntries(
    categoryOrder.map((category): [string, CategoryStat] => [
      category,
      {
        publicNames: publicExports.filter((item) => item.category === category).length,
        namesImportedDirectlyByOwa: [...directNameAppearances.keys()].filter(
          (name) => exportByName.get(name)?.category === category,
        ).length,
        directImportAppearances: [...directNameAppearances].reduce(
          (total, [name, count]) =>
            total + (exportByName.get(name)?.category === category ? count : 0),
          0,
        ),
      },
    ]),
  );

  const recipeRoot = path.join(componentSourceRoot, 'components/owa');
  const recipeSources = componentSources.filter(({ file }) =>
    file.startsWith(`${recipeRoot}${path.sep}`),
  );
  const recipeSharedFiles = new Set<string>();
  const recipeInternalFiles = new Set<string>();
  let nonRecipeFilesImportingRecipes = 0;
  const publicComponentAreas = [
    'buttons',
    'cookies',
    'form-elements',
    'house-cat',
    'images-and-icons',
    'layout-and-structure',
    'messaging-and-feedback',
    'navigation',
    'presentational',
    'typography',
    'unstyled',
    'OakGlobalStyle',
    'OakThemeProvider',
  ];

  for (const source of componentSources) {
    const relative = normaliseRelative(componentSourceRoot, source.file);
    const sourceFile = ts.createSourceFile(
      source.file,
      source.text,
      ts.ScriptTarget.Latest,
      true,
      source.file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    const specifiers = importDeclarations(ts, sourceFile).map(
      (declaration) => declaration.moduleSpecifier.text,
    );
    if (relative.startsWith('components/owa/')) {
      if (specifiers.some((value) => value.includes('components/internal-components'))) {
        recipeInternalFiles.add(source.file);
      }
      if (
        specifiers.some((value) =>
          publicComponentAreas.some(
            (area) => value === `@/components/${area}` || value.startsWith(`@/components/${area}/`),
          ),
        )
      ) {
        recipeSharedFiles.add(source.file);
      }
    } else if (
      path.basename(source.file) !== 'index.ts' &&
      specifiers.some((value) => value.startsWith('@/components/owa'))
    ) {
      nonRecipeFilesImportingRecipes += 1;
    }
  }

  const oakRecipeDirectories = new Set(
    recipeSources
      .map(({ file }) => path.dirname(file))
      .filter((directory) => path.basename(directory).startsWith('Oak')),
  );
  const styleStyledComponentsFiles = componentSources.filter(
    ({ file, text }) =>
      normaliseRelative(componentSourceRoot, file).startsWith('styles/') &&
      /from\s+["']styled-components["']/.test(text),
  ).length;

  const directNames = [...directNameAppearances.keys()].filter(
    (name) => name !== 'default' && name !== '*',
  );
  const removedNames = directNames.filter((name) => !exportByName.has(name)).sort(codeUnitCompare);
  const mostFrequentDirectImports = [...directNameAppearances]
    .filter(([name]) => name !== 'default' && name !== '*')
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 20)
    .map(([name, appearances]) => ({ name, appearances }));

  await emitJson(
    {
      schemaVersion: 1,
      inputs: { owa, components },
      method: {
        sourceFiles: 'Git-tracked src/**/*.ts(x) files in each checkout',
        productionExcludes: [
          '*.test.*',
          '*.spec.*',
          '*.stories.*',
          '*.mock.*',
          '__tests__',
          '__mocks__',
          '__snapshots__',
        ],
        importMeasure: 'static ES import declarations only',
        sharedComponentSpecifier:
          '@/components/SharedComponents or a specifier containing /components/SharedComponents',
      },
      publicContract: {
        totalNames: publicExports.length,
        categories,
        exports: publicExports,
      },
      directOwaImports: {
        distinctNames: directNames.length,
        namesPresentInCurrentComponents: directNames.length - removedNames.length,
        removedNames,
        totalAppearances: [...directNameAppearances.values()].reduce(
          (total, count) => total + count,
          0,
        ),
        mostFrequent: mostFrequentDirectImports,
      },
      owaConsumers: {
        directPackageFiles: directConsumerFiles.size,
        themeReexportFiles: themeConsumerFiles.size,
        deduplicatedOakComponentFiles: oakConsumerFiles.size,
        localSharedComponentFiles: sharedConsumerFiles.size,
        oakAndLocalSharedOverlapFiles: overlap.size,
        localSharedImplementationFilesImportingOak: localSharedImplementations.size,
      },
      componentDependencies: {
        owaRecipeComponentDirectories: oakRecipeDirectories.size,
        publicRecipeNames: publicExports.filter((item) => item.category === 'recipes').length,
        recipeFilesImportingSharedPublicAreas: recipeSharedFiles.size,
        recipeFilesImportingNonExportedInternals: recipeInternalFiles.size,
        nonRecipeImplementationFilesImportingRecipes: nonRecipeFilesImportingRecipes,
        styleFilesImportingStyledComponents: styleStyledComponentsFiles,
      },
    },
    typeof args.output === 'string' ? args.output : undefined,
  );
}

await main().catch((error: unknown) =>
  usageError(error instanceof Error ? (error.stack ?? error.message) : String(error), usage),
);
