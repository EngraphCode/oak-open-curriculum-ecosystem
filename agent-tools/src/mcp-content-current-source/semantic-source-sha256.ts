import { createHash } from 'node:crypto';
import {
  createSourceFile,
  forEachChild,
  isBigIntLiteral,
  isIdentifier,
  isNumericLiteral,
  isOptionalChain,
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

const IGNORED_CANONICAL_TOKEN_KINDS: ReadonlySet<SyntaxKind> = new Set([
  SyntaxKind.CommaToken,
  SyntaxKind.OpenParenToken,
  SyntaxKind.CloseParenToken,
  SyntaxKind.SemicolonToken,
]);

function isIgnoredCanonicalToken(node: Node): boolean {
  if (node.kind >= SyntaxKind.FirstJSDocNode && node.kind <= SyntaxKind.LastJSDocNode) {
    return true;
  }
  if (IGNORED_CANONICAL_TOKEN_KINDS.has(node.kind)) {
    return true;
  }
  return (
    (node.kind === SyntaxKind.BarToken && node.parent.kind === SyntaxKind.UnionType) ||
    (node.kind === SyntaxKind.AmpersandToken && node.parent.kind === SyntaxKind.IntersectionType)
  );
}

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
  if (
    node.kind === SyntaxKind.ParenthesizedExpression ||
    node.kind === SyntaxKind.ParenthesizedType
  ) {
    forEachChild(node, (child) => appendCanonicalNode(child, sourceFile, parts));
    return;
  }
  if (isIgnoredCanonicalToken(node)) {
    return;
  }
  parts.push(String(node.kind));
  if (isOptionalChain(node)) {
    parts.push('optional-chain');
  }
  const value = literalValue(node, sourceFile);
  if (value !== undefined) {
    parts.push(value.normalize('NFC'));
  }
  for (const child of node.getChildren(sourceFile)) {
    appendCanonicalNode(child, sourceFile, parts);
  }
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
