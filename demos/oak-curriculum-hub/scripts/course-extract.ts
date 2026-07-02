/**
 * Oak Course extraction — the AST literal-evaluator behind the Course generator.
 *
 * The course is authored as JavaScript object literals inside the canonical export
 * (`Oak Course.dc.html`), not JSON, so extraction parses the export's `<script>` with the TypeScript
 * compiler API and evaluates only *literal* nodes. Any non-literal (call, variable,
 * template-with-substitution) throws with its position, so a computed value can never be silently
 * mis-extracted — extraction that also proves the content is pure data. A regex census would
 * mis-count comments and nested braces; the AST does not.
 *
 * Build tooling: imports `typescript`, lives in `scripts/` (never bundled by Next).
 */

import {
  createSourceFile,
  forEachChild,
  isArrayLiteralExpression,
  isBinaryExpression,
  isIdentifier,
  isMethodDeclaration,
  isNumericLiteral,
  isObjectLiteralExpression,
  isParenthesizedExpression,
  isPropertyAccessExpression,
  isPropertyAssignment,
  isReturnStatement,
  isStringLiteral,
  isStringLiteralLike,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
  type BinaryExpression,
  type Expression,
  type Node,
  type ObjectLiteralExpression,
  type PropertyName,
  type SourceFile,
} from 'typescript';

/**
 * A value that can appear in the course content: JSON-shaped, the closed output of the evaluator.
 * Arrays/index are mutable (not `readonly`) so `Array.isArray` narrows the union member out — this is
 * a build-time intermediate representation, serialised straight to a typed module, never shared.
 */
export type LiteralValue =
  | string
  | number
  | boolean
  | null
  | LiteralValue[]
  | { [key: string]: LiteralValue };

/** The assembled raw course object, before compile-time validation against `Course` in the emit. */
export interface RawCourse {
  readonly units: LiteralValue;
  readonly intro: LiteralValue;
  readonly modules: LiteralValue;
}

/** Describe a node's position (1-based line:col) for fail-loud diagnostics. */
function positionOf(source: SourceFile, node: Node): string {
  const { line, character } = source.getLineAndCharacterOfPosition(node.getStart(source));
  return `${line + 1}:${character + 1}`;
}

/** The static key of a property assignment, or throw for a computed / shorthand key. */
function propertyKey(source: SourceFile, name: PropertyName): string {
  if (isIdentifier(name) || isStringLiteral(name)) {
    return name.text;
  }
  throw new Error(`course extract: non-literal property key at ${positionOf(source, name)}`);
}

const KEYWORD_VALUES = new Map<SyntaxKind, LiteralValue>([
  [SyntaxKind.TrueKeyword, true],
  [SyntaxKind.FalseKeyword, false],
  [SyntaxKind.NullKeyword, null],
]);

/** Evaluate a primitive literal (string, number, boolean, null), or `undefined` if not primitive. */
function evaluatePrimitive(node: Expression): LiteralValue | undefined {
  if (isStringLiteralLike(node)) {
    return node.text;
  }
  if (isNumericLiteral(node)) {
    return Number(node.text);
  }
  return KEYWORD_VALUES.get(node.kind);
}

/** Evaluate an object literal, throwing on any non-literal (computed / shorthand / spread) property. */
function evaluateObject(source: SourceFile, node: ObjectLiteralExpression): LiteralValue {
  const object: Record<string, LiteralValue> = {};
  for (const property of node.properties) {
    if (!isPropertyAssignment(property)) {
      throw new Error(`course extract: non-literal property at ${positionOf(source, property)}`);
    }
    object[propertyKey(source, property.name)] = evaluateLiteral(source, property.initializer);
  }
  return object;
}

/** Evaluate a `string + string` concatenation, throwing on any other binary operand. */
function evaluateConcatenation(source: SourceFile, node: BinaryExpression): LiteralValue {
  const left = evaluateLiteral(source, node.left);
  const right = evaluateLiteral(source, node.right);
  if (typeof left === 'string' && typeof right === 'string') {
    return left + right;
  }
  throw new Error(`course extract: non-string concatenation at ${positionOf(source, node)}`);
}

/**
 * Evaluate a literal expression to its value. Throws on any non-literal node so a computed value is
 * a loud extraction failure, never a silent mis-read.
 */
export function evaluateLiteral(source: SourceFile, node: Expression): LiteralValue {
  const primitive = evaluatePrimitive(node);
  if (primitive !== undefined) {
    return primitive;
  }
  if (isParenthesizedExpression(node)) {
    return evaluateLiteral(source, node.expression);
  }
  if (isArrayLiteralExpression(node)) {
    return node.elements.map((element) => evaluateLiteral(source, element));
  }
  if (isObjectLiteralExpression(node)) {
    return evaluateObject(source, node);
  }
  if (isBinaryExpression(node) && node.operatorToken.kind === SyntaxKind.PlusToken) {
    return evaluateConcatenation(source, node);
  }
  throw new Error(
    `course extract: unsupported non-literal ${SyntaxKind[node.kind]} at ${positionOf(source, node)}`,
  );
}

/** Extract the `text/x-dc` script body from the export HTML (the app source authored inside it). */
export function extractScript(html: string): string {
  const match = /<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/.exec(html);
  if (match === null) {
    throw new Error('course extract: no <script type="text/x-dc"> block found in the export');
  }
  return match[1];
}

/** The return expression of the first method named `methodName`, or throw. */
function methodReturnExpression(source: SourceFile, methodName: string): Expression {
  let found: Expression | undefined;
  const visit = (node: Node): void => {
    if (
      found === undefined &&
      isMethodDeclaration(node) &&
      isIdentifier(node.name) &&
      node.name.text === methodName &&
      node.body !== undefined
    ) {
      const returnStatement = node.body.statements.find(isReturnStatement);
      if (returnStatement?.expression !== undefined) {
        found = returnStatement.expression;
      }
    }
    forEachChild(node, visit);
  };
  visit(source);
  if (found === undefined) {
    throw new Error(`course extract: no return expression for method ${methodName}()`);
  }
  return found;
}

/** The right-hand side of the first `this.<propertyName> = <expr>` assignment, or throw. */
function thisAssignmentExpression(source: SourceFile, propertyName: string): Expression {
  let found: Expression | undefined;
  const visit = (node: Node): void => {
    if (
      found === undefined &&
      isBinaryExpression(node) &&
      node.operatorToken.kind === SyntaxKind.EqualsToken &&
      isPropertyAccessExpression(node.left) &&
      node.left.expression.kind === SyntaxKind.ThisKeyword &&
      node.left.name.text === propertyName
    ) {
      found = node.right;
    }
    forEachChild(node, visit);
  };
  visit(source);
  if (found === undefined) {
    throw new Error(`course extract: no this.${propertyName} = … assignment found`);
  }
  return found;
}

/**
 * Normalise `AccordionItem.a` from a bare string to a single-element array. The source authors this
 * field inconsistently (string in 15/30 items, array in the rest); the union models meaning
 * (`readonly string[]`), so the container inconsistency is resolved once here at the data boundary
 * (Director-ratified 2026-07-01) rather than leaking `string | readonly string[]` into every
 * consumer. Lossless: a one-paragraph string becomes a one-element paragraph array.
 */
function normalizeNode(value: LiteralValue): LiteralValue {
  if (Array.isArray(value)) {
    return value.map(normalizeNode);
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  const object: Record<string, LiteralValue> = {};
  for (const key of Object.keys(value)) {
    object[key] = normalizeNode(value[key]);
  }
  if (object.t === 'accordion' && Array.isArray(object.items)) {
    object.items = object.items.map(normalizeAccordionItem);
  }
  return object;
}

/** Wrap an accordion item's bare-string `a` in a single-element array; leave array `a` untouched. */
function normalizeAccordionItem(item: LiteralValue): LiteralValue {
  if (item === null || typeof item !== 'object' || Array.isArray(item)) {
    return item;
  }
  const answer = item.a;
  return typeof answer === 'string' ? { ...item, a: [answer] } : item;
}

/** Parse the export script and extract the raw course (units + intro + modules) as literal data. */
export function extractCourse(script: string): RawCourse {
  const source = createSourceFile(
    'course.js',
    script,
    ScriptTarget.Latest,
    true,
    ScriptKind.JS,
  );
  return {
    units: normalizeNode(evaluateLiteral(source, thisAssignmentExpression(source, 'units'))),
    intro: normalizeNode(evaluateLiteral(source, methodReturnExpression(source, 'buildIntro'))),
    modules: normalizeNode(evaluateLiteral(source, methodReturnExpression(source, 'buildCourse'))),
  };
}
