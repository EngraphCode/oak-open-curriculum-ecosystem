import { describe, expect, it } from 'vitest';
import {
  assertBuiltServerDefaultExport,
  assertBundleCarriesBakedLandingPage,
  assertNoEsbuildWarnings,
  assertNoReactModuleImport,
} from './build-output-contract.js';

describe('assertBundleCarriesBakedLandingPage', () => {
  const BAKED_HTML = '<html><link rel="stylesheet" href="/landing-page.css"></html>';

  it('accepts a bundle that carries the baked page inline', () => {
    expect(() => {
      assertBundleCarriesBakedLandingPage(
        'server.js',
        'var landing_page_default = `<link rel=stylesheet href=/landing-page.css>`;',
        BAKED_HTML,
      );
    }).not.toThrow();
  });

  it('rejects a bundle missing the inlined page', () => {
    expect(() => {
      assertBundleCarriesBakedLandingPage(
        'server.js',
        'var landing_page_default = "no landing content here";',
        BAKED_HTML,
      );
    }).toThrow('server.js does not carry the baked landing page inline');
  });

  it('rejects a baked page that lost the marker (the guard must never pass vacuously)', () => {
    expect(() => {
      assertBundleCarriesBakedLandingPage('server.js', 'anything', '<html>markerless</html>');
    }).toThrow('no longer contains its marker');
  });
});

describe('assertNoReactModuleImport', () => {
  it('accepts a bundle with no react import', () => {
    expect(() => {
      assertNoReactModuleImport('server.js', 'import express from "express";\nconst x = 1;');
    }).not.toThrow();
  });

  it('accepts inlined string content that merely mentions react-dom', () => {
    // The widget's embedded bundle text contains the words react-dom; only a
    // real import/require statement is a runtime dependency.
    expect(() => {
      assertNoReactModuleImport(
        'server.js',
        'const WIDGET = `rendererPackageName:\\`react-dom\\``;',
      );
    }).not.toThrow();
  });

  it('rejects an ESM react-dom import (any subpath)', () => {
    expect(() => {
      assertNoReactModuleImport(
        'server.js',
        'import { renderToStaticMarkup } from "react-dom/server";',
      );
    }).toThrow('server.js imports react/react-dom');
  });

  it('rejects a CJS react require', () => {
    expect(() => {
      assertNoReactModuleImport('index.js', 'const React = require("react");');
    }).toThrow('index.js imports react/react-dom');
  });
});

describe('assertNoEsbuildWarnings', () => {
  it('accepts a clean esbuild result', () => {
    expect(() => {
      assertNoEsbuildWarnings([]);
    }).not.toThrow();
  });

  it('throws with the warning text when esbuild emits warnings', () => {
    expect(() => {
      assertNoEsbuildWarnings([
        { text: 'Import "default" will always be undefined' },
        { text: 'Another warning' },
      ]);
    }).toThrow(
      [
        'Esbuild emitted warnings:',
        '- Import "default" will always be undefined',
        '- Another warning',
      ].join('\n'),
    );
  });
});

describe('assertBuiltServerDefaultExport', () => {
  it('accepts an esbuild re-exported default binding inside a multi-export list', () => {
    expect(() => {
      assertBuiltServerDefaultExport(
        [
          'function handler() { return undefined; }',
          'var server_default = handler;',
          'export { server_default as default, handler };',
        ].join('\n'),
      );
    }).not.toThrow();
  });

  it('accepts a direct default export binding when it resolves to a function', () => {
    expect(() => {
      assertBuiltServerDefaultExport('const handler = () => undefined;\nexport default handler;');
    }).not.toThrow();
  });

  it('accepts an inline default function export', () => {
    expect(() => {
      assertBuiltServerDefaultExport('export default async function serverHandler() {}');
    }).not.toThrow();
  });

  it('rejects bundle output with no default export', () => {
    expect(() => {
      assertBuiltServerDefaultExport('export { handler as namedExport };');
    }).toThrow(
      'dist/server.js must default-export a function that satisfies the verified @vercel/node import contract.',
    );
  });

  it('rejects a default export binding that resolves to a non-function value', () => {
    expect(() => {
      assertBuiltServerDefaultExport('const handler = 123;\nexport default handler;');
    }).toThrow(
      'dist/server.js must default-export a function that satisfies the verified @vercel/node import contract.',
    );
  });
});
