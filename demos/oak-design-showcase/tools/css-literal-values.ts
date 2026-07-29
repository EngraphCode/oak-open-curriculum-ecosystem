/**
 * Pure classifier for the owner's no-hardcoded-values invariant, CSS half:
 * a declaration value in AUTHORED showcase CSS may compose kit token roles
 * (`var(--…)`) and plain CSS keywords, never literal design values. Parsed
 * with postcss — a real parser, never a brace scanner (the estate's
 * design-tokens comparand records why: nesting and quoted braces defeat
 * regexes). Zero IO: the gating script (validate-authored-css.ts) owns the
 * filesystem.
 *
 * A design value is: a hex colour, a colour function, a NAMED colour, a
 * literal font family, a number carrying a length/angle/time unit, or a
 * bare number on the opacity/z-index axes. Bare `0`, other unitless
 * numbers (line-height ratios), and keywords carry no design value.
 * Quoted strings, url() tokens and comments are stripped before matching —
 * except on the font axes, where quoted strings stay inspectable (a quoted
 * literal family is a hardcoded face by another door). `var()` fallbacks
 * stay scannable — a literal fallback is a hardcoded value by another
 * door. Structural math functions (clamp/minmax/min/max/repeat/
 * fit-content) get no wholesale allowance: their ARGUMENTS stay
 * scannable, so a literal length inside a clamp is reported exactly like
 * one outside it. `fr` grid tracks stay legal by absence from the unit
 * list.
 *
 * Named allowances (each deliberate, none silent):
 * - `transparent`/`currentColor` — legitimate composition keywords the kit
 *   itself uses (forced-colors outline, shadow composition).
 * - `color-mix(…)` whose colour arguments are all var() references — the
 *   kit brand contract's own hover-derivation recipe; a literal colour
 *   inside one still fails.
 * - The lone token `100%` — "full extent" is a layout guard with no token
 *   equivalent, not a design choice.
 * - At-rule params (media/container queries) are outside walkDecls'
 *   reach: breakpoints are documented kit constants, recorded here so the
 *   limitation is stated, never silent.
 */
import { parse } from 'postcss';

export interface LiteralDesignValue {
  readonly selector: string;
  readonly prop: string;
  readonly value: string;
}

const HEX_COLOR = /#[0-9a-f]{3,8}\b/i;
const COLOR_FUNCTION = /(?:^|[\s(,])(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch|color|color-mix)\(/i;
// Number-then-suffix capture with the unit test delegated to a Set: the
// one-alternation number grammar has no overlapping quantifiers (S8786)
// and the Set replaces the 30-branch unit alternation (S5843). The suffix
// class and the boundary lookahead are disjoint, so no backtracking
// ambiguity exists between them.
// `*` sits in both boundary classes: CSS requires no whitespace around the
// multiplication operator in calc(), so `calc(10px*2)` must stay scannable.
const NUMBER_WITH_SUFFIX = /(?:^|[\s(,/*])[+-]?(?:\d+(?:\.\d+)?|\.\d+)([a-z%]+)(?=[\s),/*]|$)/gi;
const UNITS = new Set([
  'px',
  'rem',
  'em',
  '%',
  'vh',
  'vw',
  'vmin',
  'vmax',
  'dvh',
  'dvw',
  'svh',
  'svw',
  'lvh',
  'lvw',
  'cqw',
  'cqh',
  'cqi',
  'cqb',
  'cqmin',
  'cqmax',
  'ch',
  'ex',
  'cap',
  'ic',
  'lh',
  'rlh',
  'pt',
  'pc',
  'cm',
  'mm',
  'in',
  'q',
  'deg',
  'rad',
  'grad',
  'turn',
  'ms',
  's',
]);
const BARE_NUMBER = /(?:^|[\s(,*])[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?=[\s),*]|$)/;
const IDENTIFIER = /[a-z][a-z-]*/gi;
const COLOR_MIX = /color-mix\([^()]*\)/gi;

/** The CSS named colours (spec list), lowercased. `transparent` and
 *  `currentcolor` are deliberately absent — see the allowances above. */
const NAMED_COLOURS = new Set(
  (
    'aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue ' +
    'blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk ' +
    'crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki ' +
    'darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen ' +
    'darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue ' +
    'dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ' +
    'ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ' +
    'ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan ' +
    'lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen ' +
    'lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen ' +
    'linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple ' +
    'mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred ' +
    'midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab ' +
    'orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip ' +
    'peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue ' +
    'saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue ' +
    'slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet ' +
    'wheat white whitesmoke yellow yellowgreen'
  ).split(' '),
);

function stripVarReferences(input: string): string {
  let value = input;
  let previous = '';
  while (previous !== value) {
    previous = value;
    value = value
      .replaceAll(/var\(\s*--[\w-]+\s*\)/g, ' ')
      .replaceAll(/var\(\s*--[\w-]+\s*,/g, '(');
  }
  return value;
}

function containsColourLiteral(fragment: string): boolean {
  if (HEX_COLOR.test(fragment) || COLOR_FUNCTION.test(fragment)) {
    return true;
  }
  return [...fragment.matchAll(IDENTIFIER)].some((match) =>
    NAMED_COLOURS.has(match[0].toLowerCase()),
  );
}

function containsUnitLiteral(fragment: string): boolean {
  return [...fragment.matchAll(NUMBER_WITH_SUFFIX)].some((match) =>
    UNITS.has((match[1] ?? '').toLowerCase()),
  );
}

function scannableValue(raw: string): string {
  let value = stripVarReferences(
    raw
      .replaceAll(/\/\*[\s\S]*?\*\//g, ' ')
      .replaceAll(/'[^']*'|"[^"]*"/g, ' ')
      .replaceAll(/url\([^)]*\)/gi, ' '),
  );
  // color-mix over var() references only is the kit's own derivation
  // recipe; one containing a colour literal stays in scanning scope. The
  // call's ARGUMENTS are tested — the function's own name must not match
  // the colour-function scan.
  value = value.replaceAll(COLOR_MIX, (call) => {
    const args = call.slice('color-mix('.length, -1);
    return containsColourLiteral(args) ? call : ' ';
  });
  // The lone "full extent" guard.
  value = value.replaceAll(/(?<=^|[\s(,])100%(?=[\s),]|$)/g, ' ');
  return value;
}

/** The font axes keep quoted strings inspectable: a quoted literal family
 *  must not vanish with the general string strip. Comments, url() tokens
 *  and var() names still strip; fallbacks stay scannable. */
function fontScannableValue(raw: string): string {
  return stripVarReferences(
    raw.replaceAll(/\/\*[\s\S]*?\*\//g, ' ').replaceAll(/url\([^)]*\)/gi, ' '),
  );
}

function isLiteralDesignValue(prop: string, raw: string): boolean {
  const value = scannableValue(raw);
  if (containsColourLiteral(value) || containsUnitLiteral(value)) {
    return true;
  }
  if (/^(?:opacity|z-index)$/i.test(prop) && BARE_NUMBER.test(value)) {
    return true;
  }
  // A literal family (or any literal identifier or quoted string) on the
  // font axes: the ramp tokens own the faces — brand.css calls the display
  // face "the single biggest 'different feel' knob". CSS-wide keywords are
  // NOT design values (`font: inherit` defers to the cascade where the
  // token lives) and are subtracted before the identifier test.
  if (/^font(?:-family)?$/i.test(prop)) {
    const value = fontScannableValue(raw).replaceAll(
      /(?:^|[\s(,])(?:inherit|initial|unset|revert-layer|revert)(?=[\s),]|$)/gi,
      ' ',
    );
    if (/[a-z'"]/i.test(value)) {
      return true;
    }
  }
  return false;
}

/** Every declaration in the stylesheet whose value carries a literal design
 *  value, with enough context to name the cure site. */
export function findLiteralDesignValues(css: string): readonly LiteralDesignValue[] {
  const findings: LiteralDesignValue[] = [];
  parse(css).walkDecls((decl) => {
    if (isLiteralDesignValue(decl.prop, decl.value)) {
      const parent = decl.parent;
      const selector =
        parent !== undefined && 'selector' in parent && typeof parent.selector === 'string'
          ? parent.selector
          : '(at-rule)';
      findings.push({ selector, prop: decl.prop, value: decl.value });
    }
  });
  return findings;
}
