# @oaknational/oak-design-react

The React binding tier for the Oak Open Curriculum Design System — the
downstream sibling ADR-213 §3 decides: the kit
(`@oaknational/oak-design-system`) holds what is framework-invariant; this
package holds what is React-covariant.

## First resident: the theme-store adapter

`createOakThemeStore` / `oakThemeStore` — a `useSyncExternalStore`-shaped
adapter over the kit's `oakTheme` runtime. The theme snapshot is the CHOICE
model read through the runtime's `choice()` accessor: `undefined` means no
runtime (server render — HTML stays theme-neutral), `''` means no explicit
choice (render a "Page default" placeholder, never pin a concrete theme).
The store carries no contrast-media mirror: under the choice model the
OS-contrast route changes only the applied theme, never `choice()`, so no
exposed snapshot can change on that trigger — an applied-theme accessor
(with its mirror) lands at first materialised need.

The adapter is factory-pure and has **no React dependency**: consumers hand
its members to `useSyncExternalStore`. React itself arrives with the tier's
first component export, which is gated — per ADR-213 §3's hard gate, the
ADR-147 accessibility gate extension must land for this package before any
component ships.

The package's edge to the kit is **contract-only**: `OakThemeRuntime`
re-declares the runtime's public API (the kit ships no type declarations),
and this module is the estate's single ambient declarer of
`Window.oakTheme`.
