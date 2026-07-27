import { createHash } from 'node:crypto';
import {
  createSourceFile,
  forEachChild,
  isBigIntLiteral,
  isIdentifier,
  isNumericLiteral,
  isPrivateIdentifier,
  isRegularExpressionLiteral,
  isStringLiteralLike,
  isTemplateLiteralToken,
  type Node,
  type SourceFile,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
} from 'typescript';
import { normaliseLineEndings } from './normalise-line-endings.js';

function textualNodeValue(node: Node): string | undefined {
  if (isIdentifier(node) || isPrivateIdentifier(node)) {
    return node.text;
  }
  if (isStringLiteralLike(node) || isTemplateLiteralToken(node)) {
    return node.text;
  }
  return undefined;
}

function numericNodeValue(node: Node): string | undefined {
  if (isNumericLiteral(node) || isBigIntLiteral(node) || isRegularExpressionLiteral(node)) {
    return node.text;
  }
  return undefined;
}

function literalValue(node: Node, sourceFile: SourceFile): string | undefined {
  const value = textualNodeValue(node) ?? numericNodeValue(node);
  if (value !== undefined) {
    return value;
  }
  return node.kind === SyntaxKind.JsxText ? node.getText(sourceFile) : undefined;
}

function appendCanonicalNode(node: Node, sourceFile: SourceFile, parts: string[]): void {
  if (node.kind === SyntaxKind.ParenthesizedExpression) {
    forEachChild(node, (child) => appendCanonicalNode(child, sourceFile, parts));
    return;
  }
  parts.push(String(node.kind));
  const value = literalValue(node, sourceFile);
  if (value !== undefined) {
    parts.push(value.normalize('NFC'));
  }
  forEachChild(node, (child) => appendCanonicalNode(child, sourceFile, parts));
}

/**
 * Hashes parsed TypeScript structure rather than source trivia.
 *
 * Whitespace, comments, line endings, quote style, optional semicolons,
 * trailing commas, and redundant parentheses do not change the digest.
 * Wording, collection membership, operators, and parsed structure do.
 */
export function semanticSourceSha256(content: string, file: string): string {
  const sourceFile = createSourceFile(
    file,
    normaliseLineEndings(content),
    ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ScriptKind.TSX : ScriptKind.TS,
  );
  const parts: string[] = [];
  appendCanonicalNode(sourceFile, sourceFile, parts);
  return createHash('sha256').update(parts.join('\u0000')).digest('hex');
}
