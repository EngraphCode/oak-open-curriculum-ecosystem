/**
 * The white-label specimen: one composition, re-skinned by a query parameter.
 *
 * Identity is QUERY-ADDRESSABLE and applied SERVER-SIDE. The route reads
 * `?brand=`, narrows it through the closed `IDENTITIES` list, and renders the
 * brand stylesheet link into the document React hoists to `<head>`. The sheet
 * is therefore present in the initial HTML, so the brand is correct at first
 * paint by construction — there is no flash to suppress rather than a flash
 * suppressed by script. That also mirrors how the kit says production applies
 * identity (`consuming-nextjs.md` §5: one static sheet per tenant, no client
 * logic), which matters for a page whose whole claim is that presentation is
 * data.
 *
 * Slugs are never re-typed here: every identity name derives from the imported
 * constant, which is what keeps the identity-naming ratchet at zero delta in a
 * new file while a rename is in flight.
 *
 * Region coverage is deliberately partial while the composition lands — see
 * the plan node's ten-region inventory. Each region is a pure presentational
 * function over design-system classes; the app-local class names carry layout
 * only, in `specimen.css`, tokens-only.
 */
import { BASE_IDENTITY, resolveIdentity } from '../../../components/useIdentity';

import './specimen.css';

function UtilityRegion(): React.JSX.Element {
  return (
    <div className="oak-region util" data-region="utility">
      <div className="oak-container oak-cluster oak-cluster--s util-inner">
        <span className="oak-body-3">You are viewing the</span>
        <nav className="oak-cluster oak-cluster--s" aria-label="Audience">
          <a className="oak-link oak-body-3" href="#main">
            teacher
          </a>
          <span className="oak-body-3" aria-hidden="true">
            ·
          </span>
          <a className="oak-link oak-body-3" href="#main">
            pupil
          </a>
        </nav>
        <span className="oak-body-3">experience</span>
        <a className="oak-link oak-body-3 push" href="#main">
          Help centre
        </a>
      </div>
    </div>
  );
}

function MastheadRegion(): React.JSX.Element {
  return (
    <header className="oak-region mast" data-region="masthead">
      <div className="oak-container oak-cluster mast-inner">
        <span className="oak-heading-6 brand-name">The learning service</span>
        <nav className="oak-cluster oak-cluster--s site-nav" aria-label="Main">
          <a className="oak-link oak-body-2" href="#browse">
            Subjects
          </a>
          <a className="oak-link oak-body-2" href="#browse">
            Units
          </a>
          <a className="oak-link oak-body-2" href="#lesson">
            Lessons
          </a>
          <a className="oak-link oak-body-2" href="#resources">
            Guidance
          </a>
          <a className="oak-link oak-body-2" href="#support">
            Support
          </a>
        </nav>
        <search className="oak-cluster oak-cluster--s site-search">
          <label className="oak-visually-hidden" htmlFor="site-q">
            Search
          </label>
          <input className="oak-input" id="site-q" type="search" placeholder="Search lessons…" />
          <button className="oak-btn oak-btn--sm oak-btn--secondary" type="button">
            <span className="oak-icon--mask ic-search search-icon" aria-hidden="true" />
            Search
          </button>
        </search>
        <button className="oak-btn oak-btn--sm" type="button">
          Sign in
        </button>
      </div>
    </header>
  );
}

export default async function SpecimenPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const identity = resolveIdentity((await searchParams)['brand']);

  return (
    <>
      {identity === BASE_IDENTITY ? null : (
        <link rel="stylesheet" href={`/brands/${identity}/brand.css`} />
      )}
      <div className="oak-canvas" data-identity={identity}>
        <UtilityRegion />
        <MastheadRegion />
        <main id="main" className="oak-main oak-region" data-region="main" />
      </div>
    </>
  );
}
