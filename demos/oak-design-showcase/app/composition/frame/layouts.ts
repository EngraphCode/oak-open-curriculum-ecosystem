/**
 * The composition demo's closed vocabularies, shared by the exhibit route
 * (server first paint) and the parent page's controls (live switching).
 * Four layouts spanning the engine's extremes — from the canonical
 * document stack to a fully inverted visual order — and the two exhibit
 * grounds (owner spec 2026-08-18: light or dark only).
 */
import { typeSafeKeys } from '@oaknational/type-helpers';

export const COMPOSITION_LAYOUTS = {
  document: 'Document — the canonical stack',
  magazine: 'Magazine — asymmetric two-column',
  dashboard: 'Dashboard — rails and tiles',
  inverted: 'Inverted — the order reversed',
} as const;

export type CompositionLayout = keyof typeof COMPOSITION_LAYOUTS;

export const LAYOUT_OPTIONS: readonly CompositionLayout[] = typeSafeKeys(COMPOSITION_LAYOUTS);

export const EXHIBIT_THEMES = {
  light: 'Light',
  dark: 'Dark',
} as const;

export type ExhibitTheme = keyof typeof EXHIBIT_THEMES;

export const EXHIBIT_THEME_OPTIONS: readonly ExhibitTheme[] = typeSafeKeys(EXHIBIT_THEMES);

export function isCompositionLayout(value: string): value is CompositionLayout {
  const names: readonly string[] = LAYOUT_OPTIONS;
  return names.includes(value);
}

export function isExhibitTheme(value: string): value is ExhibitTheme {
  const names: readonly string[] = EXHIBIT_THEME_OPTIONS;
  return names.includes(value);
}

export function resolveLayout(value: string | string[] | undefined): CompositionLayout {
  return typeof value === 'string' && isCompositionLayout(value) ? value : 'document';
}

export function resolveExhibitTheme(value: string | string[] | undefined): ExhibitTheme {
  return typeof value === 'string' && isExhibitTheme(value) ? value : 'light';
}
