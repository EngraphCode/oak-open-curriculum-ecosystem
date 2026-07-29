/**
 * Lineage for audit rows relocated or retired AFTER the phase-(a) capture by
 * later merged work — whether the baseline source file was removed (the
 * MCP-300 imperative-guidance removal 4e3ba6964, the MCP-128 React landing
 * rebuild f09083987) or survives with selected governed bodies extracted
 * elsewhere (the MCP-337 registration-descriptor split).
 *
 * Empty targets mean the content retired. Multiple targets preserve split
 * lineage where one historical row now contributes to more than one source.
 */

const ORIENTATION_GUIDANCE = 'packages/sdks/oak-curriculum-sdk/src/mcp/orientation-guidance.ts';

/**
 * MCP-300 deleted prerequisite-guidance.ts: the orientation constants
 * relocated to orientation-guidance.ts; the three call-this-first imperative
 * strings retired with the removed behaviour.
 */
const ORIENTATION_ERA_LINEAGE_ENTRIES = [
  ['C001', [ORIENTATION_GUIDANCE]],
  ['C002', []],
  ['C003', []],
  ['C004', []],
  ['C005', [ORIENTATION_GUIDANCE]],
  ['C006', [ORIENTATION_GUIDANCE]],
] as const;

/**
 * MCP-300 also removed the PREREQUISITE imperative injection from every
 * generated tool description, and its generator constant
 * (DOMAIN_PREREQUISITE_GUIDANCE, C455): all retired with the behaviour.
 */
const PREREQUISITE_INJECTION_RETIREMENTS = [
  ['C455', []],
  ['C502', []],
  ['C513', []],
  ['C523', []],
  ['C533', []],
  ['C540', []],
  ['C545', []],
  ['C552', []],
  ['C560', []],
  ['C567', []],
  ['C573', []],
  ['C580', []],
  ['C590', []],
  ['C599', []],
] as const;

const LANDING_ROOT = 'apps/oak-curriculum-mcp-streamable-http/src/landing-page';
const LANDING_COMPONENTS = `${LANDING_ROOT}/components`;
const LANDING_DOCUMENT = `${LANDING_COMPONENTS}/landing-page-document.tsx`;
const PAGE_SECTIONS = `${LANDING_COMPONENTS}/page-sections.tsx`;
export const RESOURCES_SECTION = `${LANDING_COMPONENTS}/resources-section.tsx`;
export const TOOLS_SECTION = `${LANDING_COMPONENTS}/tools-section.tsx`;
const DERIVE_VIEW_PROPS = `${LANDING_ROOT}/derive-view-props.ts`;

/**
 * MCP-128 rebuilt the landing page as baked React: the string renderers gave
 * way to components/; the decorative logo's alt text (C342, now alt="") and
 * the grouped expand-hint (C370, native disclosures) retired with the design.
 */
const LANDING_REACT_LINEAGE_ENTRIES = [
  ['C341', [LANDING_DOCUMENT]],
  ['C342', []],
  ['C343', [PAGE_SECTIONS]],
  ['C344', [PAGE_SECTIONS]],
  ['C345', [PAGE_SECTIONS]],
  ['C346', [PAGE_SECTIONS]],
  ['C347', [PAGE_SECTIONS]],
  ['C348', [PAGE_SECTIONS]],
  ['C349', [PAGE_SECTIONS]],
  ['C350', [PAGE_SECTIONS]],
  ['C351', [PAGE_SECTIONS]],
  ['C352', [PAGE_SECTIONS]],
  ['C353', [LANDING_DOCUMENT]],
  ['C360', [RESOURCES_SECTION]],
  ['C361', [RESOURCES_SECTION]],
  ['C362', [TOOLS_SECTION]],
  ['C363', [TOOLS_SECTION]],
  ['C364', [TOOLS_SECTION]],
  ['C365', [TOOLS_SECTION]],
  ['C366', [TOOLS_SECTION]],
  ['C367', [TOOLS_SECTION]],
  ['C368', [TOOLS_SECTION]],
  ['C369', [DERIVE_VIEW_PROPS]],
] as const;

const RESOURCE_REGISTRATIONS =
  'apps/oak-curriculum-mcp-streamable-http/src/resource-registrations.ts';

/**
 * MCP-337 turned register-resources.ts into the registration descriptor and
 * extracted the per-resource registration bodies to resource-registrations.ts:
 * the five registration-content rows relocated with their bodies (the
 * descriptor file survives as gating/derivation implementation). MCP-353 then
 * retired the four under-the-hood resource rows (C337–C340) with the resource
 * itself — the directory-policy §2.F cure deleted the pointer resource; only
 * the documentation fallback template (C336) still lives at the new home.
 */
const REGISTRATION_DESCRIPTOR_RELOCATIONS = [
  ['C336', [RESOURCE_REGISTRATIONS]],
  ['C337', []],
  ['C338', []],
  ['C339', []],
  ['C340', []],
] as const;

/**
 * MCP-353 cured the directory-policy §2.F fetch-and-follow shape on the
 * oak-under-the-hood tool: the fetch trigger (C375), the canonical raw-GitHub
 * URL (C377), the resource_link fields (C380–C383), and the public-allowlist
 * row for the deleted resource (C413) all retired with the pointer design.
 * The served orientation body is the reviewed addition A010 (generated,
 * parity-gated digest of the canonical skill).
 */
const UNDER_THE_HOOD_BAKE_RETIREMENTS = [
  ['C375', []],
  ['C377', []],
  ['C380', []],
  ['C381', []],
  ['C382', []],
  ['C383', []],
  ['C413', []],
] as const;

/** All post-baseline lineage, composed for the current-item lineage map. */
export const POST_BASELINE_LINEAGE_ENTRIES = [
  ...ORIENTATION_ERA_LINEAGE_ENTRIES,
  ...PREREQUISITE_INJECTION_RETIREMENTS,
  ...LANDING_REACT_LINEAGE_ENTRIES,
  ...REGISTRATION_DESCRIPTOR_RELOCATIONS,
  ...UNDER_THE_HOOD_BAKE_RETIREMENTS,
] as const;
