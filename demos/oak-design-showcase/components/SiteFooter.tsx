import type { ReactElement } from 'react';

/** Footer region: attribution and the repository's licence boundaries. */
export function SiteFooter(): ReactElement {
  return (
    <footer className="oak-region foot" data-region="footer">
      <div className="oak-container oak-stack oak-stack--s foot-inner">
        <p className="oak-body-3 brand-name">Built by Oak National Academy.</p>
        <p className="oak-body-3">
          Code is MIT; Oak curriculum data is OGL v3.0; Oak brand assets carry no licence grant.{' '}
          <a
            className="oak-link"
            href="https://github.com/oaknational/oak-open-curriculum-ecosystem"
          >
            Source repository
          </a>
        </p>
      </div>
    </footer>
  );
}
