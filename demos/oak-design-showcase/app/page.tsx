import type { ReactElement } from 'react';

/**
 * Placeholder landing for the design-showcase demo. The absorb slice proves
 * the workspace (estate configs, gates, kit consumption); the showcase page
 * itself — identity × theme switchers over the full kit — lands in the next
 * slice (MCP-371 slice 2).
 */
export default function ShowcasePlaceholder(): ReactElement {
  return (
    <main className="oak-container">
      <h1 className="oak-heading-1">Oak Open Curriculum Design System</h1>
      <p className="oak-body-1">
        This workspace hosts the live design-system showcase. The one-page tour — foundations,
        components, identity and theme switching — is landing here next.
      </p>
    </main>
  );
}
