/* @ds-bundle: {"format":3,"namespace":"OakNationalAcademyDesignSystem_3ddccf","components":[],"sourceHashes":{"preview/tweaks-panel.jsx":"7fd7d9cae8ff","src/styles/theme/borders.ts":"c07497b3f498","src/styles/theme/color.ts":"32176889c8b8","src/styles/theme/default.theme.ts":"93560eeed3b1","src/styles/theme/dropShadow.ts":"4795308e193e","src/styles/theme/typography.ts":"df042487b751","ui_kits/oak/Sections.jsx":"a29da68afdb2","ui_kits/oak/shared.jsx":"5642888b8637"},"inlinedExternals":[],"unexposedExports":[{"name":"oakBorderRadiusTokens","sourcePath":"src/styles/theme/borders.ts"},{"name":"oakBorderWidthTokens","sourcePath":"src/styles/theme/borders.ts"},{"name":"oakColorFilterTokens","sourcePath":"src/styles/theme/color.ts"},{"name":"oakColorTokens","sourcePath":"src/styles/theme/color.ts"},{"name":"oakDefaultTheme","sourcePath":"src/styles/theme/default.theme.ts"},{"name":"oakDropShadowTokens","sourcePath":"src/styles/theme/dropShadow.ts"},{"name":"oakFontSizeTokens","sourcePath":"src/styles/theme/typography.ts"},{"name":"oakFontTokens","sourcePath":"src/styles/theme/typography.ts"},{"name":"oakTextDecorations","sourcePath":"src/styles/theme/typography.ts"},{"name":"oakTextOverflows","sourcePath":"src/styles/theme/typography.ts"},{"name":"oakUiRoleTokens","sourcePath":"src/styles/theme/color.ts"},{"name":"oakWhiteSpaces","sourcePath":"src/styles/theme/typography.ts"},{"name":"oakWordWraps","sourcePath":"src/styles/theme/typography.ts"}]} */

(() => {

const __ds_ns = (window.OakNationalAcademyDesignSystem_3ddccf = window.OakNationalAcademyDesignSystem_3ddccf || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// preview/tweaks-panel.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling - build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react - the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability - if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag - ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char - so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings - map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick - checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor - curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts - a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "preview/tweaks-panel.jsx", error: String((e && e.message) || e) }); }

// src/styles/theme/borders.ts
try { (() => {
const oakBorderWidthTokens = {
  "border-solid-none": 0,
  "border-solid-s": 1,
  "border-solid-m": 2,
  "border-solid-l": 3,
  "border-solid-xl": 4,
  "border-solid-xxl": 6,
  "border-solid-xxxl": 8,
  "border-solid-xxxxl": 10
};
const oakBorderRadiusTokens = {
  "border-radius-square": 0,
  "border-radius-xs": 2,
  "border-radius-s": 4,
  "border-radius-m": 6,
  "border-radius-m2": 8,
  "border-radius-l": 16,
  "border-radius-xl": 24,
  "border-radius-circle": 100
};
Object.assign(__ds_scope, { oakBorderWidthTokens, oakBorderRadiusTokens });
})(); } catch (e) { __ds_ns.__errors.push({ path: "src/styles/theme/borders.ts", error: String((e && e.message) || e) }); }

// src/styles/theme/color.ts
try { (() => {
const oakColorTokens = {
  white: "#ffffff",
  grey10: "#f9f9f9",
  grey20: "#f2f2f2",
  grey30: "#e4e4e4",
  grey40: "#cacaca",
  grey50: "#808080",
  grey60: "#575757",
  grey70: "#2d2d2d",
  grey80: "#1b1b1b",
  black: "#222222",
  oakGreen: "#287c34",
  mint: "#bef2bd",
  mint30: "#ebfbeb",
  mint50: "#dff9de",
  mint110: "#93e892",
  aqua: "#b0e2de",
  aqua30: "#e7f6f5",
  aqua50: "#d7f1ef",
  aqua110: "#7cd8d0",
  lavender: "#a0b6f2",
  lavender30: "#e3e9fb",
  lavender50: "#bdcdf5",
  lavender110: "#7c9aec",
  pink: "#deb7d5",
  pink30: "#f5e9f2",
  pink50: "#efdbea",
  pink110: "#cf9cc3",
  lemon: "#ffe555",
  lemon30: "#fff7cc",
  lemon50: "#fff2aa",
  lemon110: "#fbd60e",
  amber: "#ff934e",
  amber30: "#ffece0",
  amber50: "#ffc8a6",
  red: "#dd0035",
  red30: "#f8d8e0",
  red50: "#ee809a",
  navy: "#0d24c4",
  navy110: "#0a1d9d",
  navy120: "#081676",
  blue: "#374cf1",
  magenta: "#d02aa7",
  purple: "#845ad9",
  teal: "#037b7d",
  blackSemiTransparent: "#22222240",
  whiteSemiTransparent: "#ffffff40",
  transparent: "transparent",
  "rpf-syntax-blue": "#9EE8FF",
  "rpf-syntax-green": "#94F9AF",
  "rpf-syntax-grey": "#FBFBFB",
  "rpf-syntax-pink": "#EECCFF"
};
/**
 *
 *  Use this tool to convert Hex to color filter values https://codepen.io/sosuke/pen/Pjoqqp
 *
 */

const oakColorFilterTokens = {
  black: "invert(10%) sepia(1%) saturate(236%) hue-rotate(314deg) brightness(95%) contrast(91%)",
  red: "invert(13%) sepia(78%) saturate(5255%) hue-rotate(337deg) brightness(88%) contrast(111%)",
  oakGreen: "invert(37%) sepia(16%) saturate(1947%) hue-rotate(77deg) brightness(100%) contrast(88%)",
  white: "invert(98%) sepia(98%) saturate(0%) hue-rotate(328deg) brightness(102%) contrast(102%)",
  grey40: "invert(92%) sepia(0%) saturate(581%) hue-rotate(147deg) brightness(94%) contrast(80%)",
  grey50: "invert(54%) sepia(0%) saturate(38%) hue-rotate(176deg) brightness(92%) contrast(91%)",
  grey60: "invert(34%) sepia(0%) saturate(698%) hue-rotate(158deg) brightness(95%) contrast(89%)",
  navy: "invert(21%) sepia(90%) saturate(3220%) hue-rotate(232deg) brightness(71%) contrast(127%)",
  navy110: "invert(16%) sepia(72%) saturate(7176%) hue-rotate(239deg) brightness(61%) contrast(109%)",
  navy120: "invert(12%) sepia(79%) saturate(3172%) hue-rotate(231deg) brightness(82%) contrast(114%)",
  amber: "brightness(0) saturate(100%) invert(57%) sepia(99%) saturate(395%) hue-rotate(330deg) brightness(102%) contrast(101%);",
  lemon: "invert(82%) sepia(25%) saturate(963%) hue-rotate(359deg) brightness(106%) contrast(101%)",
  pink: "brightness(0) saturate(100%) invert(91%) sepia(5%) saturate(2279%) hue-rotate(278deg) brightness(89%) contrast(94%)",
  pink50: "brightness(0) saturate(100%) invert(95%) sepia(3%) saturate(1596%) hue-rotate(279deg) brightness(95%) contrast(87%)",
  mint: "brightness(0) saturate(100%) invert(85%) sepia(7%) saturate(1206%) hue-rotate(70deg) brightness(110%) contrast(90%)",
  mint30: "brightness(0) saturate(100%) invert(85%) sepia(23%) saturate(120%) hue-rotate(71deg) brightness(112%) contrast(97%);",
  mint50: "brightness(0) saturate(100%) invert(95%) sepia(12%) saturate(443%) hue-rotate(59deg) brightness(102%) contrast(95%)",
  mint110: "brightness(0) saturate(100%) invert(88%) sepia(21%) saturate(836%) hue-rotate(60deg) brightness(98%) contrast(86%)",
  aqua: "brightness(0) saturate(100%) invert(100%) sepia(32%) saturate(3811%) hue-rotate(166deg) brightness(108%) contrast(77%)",
  lavender: "brightness(0) saturate(100%) invert(89%) sepia(20%) saturate(5630%) hue-rotate(186deg) brightness(95%) contrast(100%)"
};
const oakUiRoleTokensConst = ["text-primary", "text-subdued", "text-error", "text-disabled", "text-link-active", "text-link-hover", "text-link-visited", "text-link-pressed", "text-inverted", "text-success", "text-promo", "bg-primary", "bg-inverted", "bg-inverted-semi-transparent", "bg-neutral", "bg-neutral-stronger", "bg-btn-primary", "bg-btn-primary-hover", "bg-btn-primary-disabled", "bg-btn-secondary", "bg-btn-secondary-hover", "bg-btn-secondary-disabled", "bg-decorative1-main", "bg-decorative1-subdued", "bg-decorative1-very-subdued", "bg-decorative2-main", "bg-decorative2-subdued", "bg-decorative2-very-subdued", "bg-decorative3-main", "bg-decorative3-subdued", "bg-decorative3-very-subdued", "bg-decorative4-main", "bg-decorative4-subdued", "bg-decorative4-very-subdued", "bg-decorative5-main", "bg-decorative5-subdued", "bg-decorative5-very-subdued", "bg-decorative6-main", "bg-decorative6-subdued", "bg-decorative6-very-subdued", "bg-interactive-element1", "bg-interactive-element2", "bg-correct", "bg-incorrect", "bg-success", "bg-error", "icon-inverted", "icon-disabled", "icon-brand", "icon-success", "icon-error", "icon-warning", "icon-primary", "icon-subdued", "icon-link-active", "icon-link-hover", "icon-link-pressed", "icon-link-visited", "icon-decorative1", "icon-decorative2", "icon-decorative3", "icon-decorative4", "icon-decorative5", "icon-decorative6", "icon-promo", "border-primary", "border-inverted", "border-neutral", "border-neutral-lighter", "border-neutral-stronger", "border-brand", "border-success", "border-error", "border-warning", "border-decorative1", "border-decorative1-stronger", "border-decorative2", "border-decorative2-stronger", "border-decorative3", "border-decorative3-stronger", "border-decorative4", "border-decorative4-stronger", "border-decorative5", "border-decorative5-stronger", "border-decorative6", "border-decorative6-stronger", "transparent", "code-blue", "code-green", "code-grey", "code-pink"];
const oakUiRoleTokens = [...oakUiRoleTokensConst];
Object.assign(__ds_scope, { oakColorTokens, oakColorFilterTokens, oakUiRoleTokens });
})(); } catch (e) { __ds_ns.__errors.push({ path: "src/styles/theme/color.ts", error: String((e && e.message) || e) }); }

// src/styles/theme/default.theme.ts
try { (() => {
const oakDefaultTheme = {
  name: "default",
  uiColors: {
    "text-primary": "black",
    "text-subdued": "grey60",
    "text-error": "red",
    "text-disabled": "grey50",
    "text-link-active": "navy",
    "text-link-hover": "navy110",
    "text-link-pressed": "navy120",
    "text-link-visited": "navy120",
    "text-inverted": "white",
    "text-success": "oakGreen",
    "text-promo": "lemon",
    "bg-primary": "white",
    "bg-inverted": "black",
    "bg-inverted-semi-transparent": "blackSemiTransparent",
    "bg-neutral": "grey20",
    "bg-neutral-stronger": "grey30",
    "bg-btn-primary": "black",
    "bg-btn-primary-hover": "grey60",
    "bg-btn-primary-disabled": "grey50",
    "bg-btn-secondary": "white",
    "bg-btn-secondary-hover": "grey20",
    "bg-btn-secondary-disabled": "grey30",
    "bg-decorative1-main": "mint",
    "bg-decorative1-subdued": "mint50",
    "bg-decorative1-very-subdued": "mint30",
    "bg-decorative2-main": "aqua",
    "bg-decorative2-subdued": "aqua50",
    "bg-decorative2-very-subdued": "aqua30",
    "bg-decorative3-main": "lavender",
    "bg-decorative3-subdued": "lavender50",
    "bg-decorative3-very-subdued": "lavender30",
    "bg-decorative4-main": "pink",
    "bg-decorative4-subdued": "pink50",
    "bg-decorative4-very-subdued": "pink30",
    "bg-decorative5-main": "lemon",
    "bg-decorative5-subdued": "lemon50",
    "bg-decorative5-very-subdued": "lemon30",
    "bg-decorative6-main": "amber",
    "bg-decorative6-subdued": "amber50",
    "bg-decorative6-very-subdued": "amber30",
    "bg-interactive-element1": "grey50",
    "bg-interactive-element2": "grey40",
    "bg-correct": "mint50",
    "bg-incorrect": "red30",
    "bg-success": "oakGreen",
    "bg-error": "red",
    "icon-inverted": "white",
    "icon-disabled": "grey50",
    "icon-brand": "oakGreen",
    "icon-success": "oakGreen",
    "icon-error": "red",
    "icon-warning": "amber",
    "icon-primary": "black",
    "icon-subdued": "grey60",
    "icon-link-active": "navy",
    "icon-link-hover": "navy110",
    "icon-link-pressed": "navy120",
    "icon-link-visited": "lavender110",
    "icon-decorative1": "mint110",
    "icon-decorative2": "aqua110",
    "icon-decorative3": "lavender110",
    "icon-decorative4": "pink110",
    "icon-decorative5": "lemon110",
    "icon-decorative6": "amber",
    "icon-promo": "lemon",
    "border-primary": "black",
    "border-inverted": "white",
    "border-neutral": "grey50",
    "border-neutral-lighter": "grey40",
    "border-neutral-stronger": "grey60",
    "border-brand": "oakGreen",
    "border-success": "oakGreen",
    "border-error": "red",
    "border-warning": "amber",
    "border-decorative1": "mint",
    "border-decorative1-stronger": "mint110",
    "border-decorative2": "aqua",
    "border-decorative2-stronger": "aqua110",
    "border-decorative3": "lavender",
    "border-decorative3-stronger": "lavender110",
    "border-decorative4": "pink",
    "border-decorative4-stronger": "pink110",
    "border-decorative5": "lemon",
    "border-decorative5-stronger": "lemon110",
    "border-decorative6": "amber50",
    "border-decorative6-stronger": "amber",
    transparent: "transparent",
    "code-blue": "rpf-syntax-blue",
    "code-green": "rpf-syntax-green",
    "code-grey": "rpf-syntax-grey",
    "code-pink": "rpf-syntax-pink"
  }
};
Object.assign(__ds_scope, { oakDefaultTheme });
})(); } catch (e) { __ds_ns.__errors.push({ path: "src/styles/theme/default.theme.ts", error: String((e && e.message) || e) }); }

// src/styles/theme/dropShadow.ts
try { (() => {
const oakDropShadowTokens = {
  "drop-shadow-standard": "0 0.5rem 0.5rem rgba(92, 92, 92, 20%)",
  "drop-shadow-lemon": `0.125rem 0.125rem 0 rgba(255, 229, 85, 100%)`,
  "drop-shadow-wide-lemon": `0.25rem 0.25rem 0 rgba(255, 229, 85, 100%)`,
  "drop-shadow-centered-lemon": `0 0 0 0.125rem rgba(255, 229, 85, 100%)`,
  "drop-shadow-grey": "0.25rem 0.25rem 0 rgba(87, 87, 87, 100%)",
  "drop-shadow-centered-grey": "0 0 0 0.3rem rgba(87, 87, 87, 100%)",
  "drop-shadow-black": "0.063rem 0.125rem 0 rgba(0,0,0, 100%)",
  "drop-shadow-centred-standard": `0 0 0.5rem rgba(92, 92, 92, 20%)`,
  "drop-shadow-none": `none`
};
Object.assign(__ds_scope, { oakDropShadowTokens });
})(); } catch (e) { __ds_ns.__errors.push({ path: "src/styles/theme/dropShadow.ts", error: String((e && e.message) || e) }); }

// src/styles/theme/typography.ts
try { (() => {
const oakFontSizeTokens = {
  "font-size-1": 12,
  "font-size-2": 14,
  "font-size-3": 16,
  "font-size-4": 18,
  "font-size-5": 20,
  "font-size-6": 24,
  "font-size-7": 32,
  "font-size-8": 40,
  "font-size-9": 48,
  "font-size-10": 56
};
const fontWeights = [300, 400, 600, 700];
const lineHeights = [16, 20, 24, 28, 32, 40, 48, 56, 64];
const letterSpacings = ["0.0115rem", "-0.005rem"];
const oakFontTokens = {
  "heading-1": ["font-size-10", 64, 600, "0.0115rem"],
  "heading-2": ["font-size-9", 56, 600, "0.0115rem"],
  "heading-3": ["font-size-8", 48, 600, "0.0115rem"],
  "heading-4": ["font-size-7", 40, 600, "0.0115rem"],
  "heading-5": ["font-size-6", 32, 600, "0.0115rem"],
  "heading-6": ["font-size-5", 24, 600, "0.0115rem"],
  "heading-7": ["font-size-3", 20, 600, "0.0115rem"],
  "heading-light-1": ["font-size-10", 64, 400, "0.0115rem"],
  "heading-light-2": ["font-size-9", 56, 400, "0.0115rem"],
  "heading-light-3": ["font-size-8", 48, 400, "0.0115rem"],
  "heading-light-4": ["font-size-7", 40, 400, "0.0115rem"],
  "heading-light-5": ["font-size-6", 32, 400, "0.0115rem"],
  "heading-light-6": ["font-size-5", 24, 400, "0.0115rem"],
  "heading-light-7": ["font-size-3", 20, 400, "0.0115rem"],
  "body-1": ["font-size-4", 28, 300, "-0.005rem"],
  "body-2": ["font-size-3", 24, 300, "-0.005rem"],
  "body-3": ["font-size-2", 20, 300, "-0.005rem"],
  "body-4": ["font-size-1", 16, 300, "-0.005rem"],
  "body-1-bold": ["font-size-4", 28, 700, "-0.005rem"],
  "body-2-bold": ["font-size-3", 24, 700, "-0.005rem"],
  "body-3-bold": ["font-size-2", 20, 700, "-0.005rem"],
  "list-item-1": ["font-size-4", 32, 300, "-0.005rem"],
  "list-item-2": ["font-size-3", 24, 300, "-0.005rem"],
  "code-1": ["font-size-6", 32, 300, "0.0115rem"],
  "code-1-bold": ["font-size-6", 32, 700, "0.0115rem"],
  "code-2": ["font-size-4", 24, 300, "0.0115rem"],
  "code-2-bold": ["font-size-4", 24, 700, "0.0115rem"],
  "code-3": ["font-size-3", 20, 300, "0.0115rem"],
  "code-3-bold": ["font-size-3", 20, 700, "0.0115rem"]
};
const oakTextDecorationsConst = ["underline", "overline", "line-through", "none"];
const oakWhiteSpacesConst = ["normal", "nowrap", "wrap", "pre", "pre-wrap", "pre-line", "break-spaces"];
const oakWordWrapsConst = ["normal", "break-word", "initial", "inherit"];
const oakTextOverflowsConst = ["clip", "ellipsis"];
const oakTextDecorations = [...oakTextDecorationsConst];
const oakWhiteSpaces = [...oakWhiteSpacesConst];
const oakWordWraps = [...oakWordWrapsConst];
const oakTextOverflows = [...oakTextOverflowsConst];
Object.assign(__ds_scope, { oakFontSizeTokens, oakFontTokens, oakTextDecorations, oakWhiteSpaces, oakWordWraps, oakTextOverflows });
})(); } catch (e) { __ds_ns.__errors.push({ path: "src/styles/theme/typography.ts", error: String((e && e.message) || e) }); }

// ui_kits/oak/Sections.jsx
try { (() => {
// Oak UI Kit — page sections, matching thenational.academy structure.
// Relies on shared.jsx (Icon, SubjectChip, Button, Tag, SUBJECTS).

function Hero() {
  return React.createElement("section", {
    style: {
      background: "#b0e2de",
      borderBottom: "2px solid #222"
    }
  }, React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: "0 auto",
      padding: "72px 24px",
      display: "grid",
      gridTemplateColumns: "1.15fr 1fr",
      gap: 56,
      alignItems: "center"
    }
  }, React.createElement("div", null, React.createElement("h1", {
    style: {
      font: "600 56px/64px var(--font-sans)",
      letterSpacing: "0.0115rem",
      margin: 0,
      color: "#222",
      maxWidth: 600
    }
  }, "Free resources for ", React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-block"
    }
  }, "every lesson", React.createElement("svg", {
    viewBox: "0 0 280 14",
    preserveAspectRatio: "none",
    style: {
      position: "absolute",
      left: 0,
      bottom: -6,
      width: "100%",
      height: 14
    }
  }, React.createElement("path", {
    d: "M 2 8 Q 70 2 140 7 T 278 6",
    stroke: "#ffe555",
    strokeWidth: 8,
    fill: "none",
    strokeLinecap: "round"
  }))), ", every pupil."), React.createElement("p", {
    style: {
      font: "300 18px/28px var(--font-sans)",
      letterSpacing: "-0.005rem",
      margin: "24px 0 32px",
      maxWidth: 520,
      color: "#222"
    }
  }, "Adaptable curriculum plans and resources from key stage 1 to 4, plus AI tools to create and tailor lessons in minutes. Created by experts, tested by teachers, and free — always."), React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap"
    }
  }, React.createElement(Button, {
    variant: "primary",
    iconRight: "arrow-right"
  }, "Browse subjects"), React.createElement(Button, {
    variant: "secondary"
  }, "Explore AI tools"))), React.createElement("div", {
    style: {
      position: "relative",
      height: 360
    }
  }, React.createElement("div", {
    style: {
      position: "absolute",
      right: 0,
      top: 20,
      width: 280,
      height: 196,
      background: "#fff",
      border: "3px solid #222",
      borderRadius: 16,
      boxShadow: "8px 8px 0 #222",
      transform: "rotate(3deg)",
      padding: 20
    }
  }, React.createElement(SubjectChip, {
    subject: "science",
    size: 44
  }), React.createElement("div", {
    style: {
      font: "700 11px/14px var(--font-sans)",
      color: "#575757",
      marginTop: 14,
      letterSpacing: "0.06em",
      textTransform: "uppercase"
    }
  }, "Science · Year 7"), React.createElement("div", {
    style: {
      font: "600 20px/26px var(--font-sans)",
      marginTop: 8
    }
  }, "Cells, tissues and organs"), React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginTop: 14
    }
  }, ["video", "quiz", "worksheet", "slide-deck"].map(i => React.createElement(Icon, {
    key: i,
    name: i,
    size: 22
  })))), React.createElement("div", {
    style: {
      position: "absolute",
      left: 10,
      top: 170,
      width: 244,
      height: 150,
      background: "#ffe555",
      border: "3px solid #222",
      borderRadius: 16,
      boxShadow: "8px 8px 0 #222",
      transform: "rotate(-4deg)",
      padding: 20
    }
  }, React.createElement(SubjectChip, {
    subject: "english",
    size: 40
  }), React.createElement("div", {
    style: {
      font: "700 11px/14px var(--font-sans)",
      color: "#222",
      marginTop: 12,
      letterSpacing: "0.06em",
      textTransform: "uppercase"
    }
  }, "English · Year 9"), React.createElement("div", {
    style: {
      font: "600 18px/24px var(--font-sans)",
      marginTop: 6
    }
  }, "'An Inspector Calls'")), React.createElement("div", {
    style: {
      position: "absolute",
      left: 120,
      top: 0,
      background: "#fff",
      border: "3px solid #222",
      padding: "8px 16px",
      borderRadius: 100,
      boxShadow: "3px 3px 0 #222",
      font: "700 14px var(--font-sans)",
      transform: "rotate(-6deg)"
    }
  }, "Free forever ✶"))));
}
function TrustBand() {
  const stats = [["40+", "subjects"], ["12,000+", "free lessons"], ["KS1–KS4", "covered"], ["100%", "free, always"]];
  return React.createElement("section", {
    style: {
      borderBottom: "2px solid #222",
      background: "#fff"
    }
  }, React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: "0 auto",
      padding: "32px 24px",
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 24
    }
  }, stats.map(([n, l]) => React.createElement("div", {
    key: l,
    style: {
      textAlign: "center"
    }
  }, React.createElement("div", {
    style: {
      font: "600 40px/48px var(--font-sans)",
      letterSpacing: "0.0115rem",
      color: "#287c34"
    }
  }, n), React.createElement("div", {
    style: {
      font: "300 16px/24px var(--font-sans)",
      letterSpacing: "-0.005rem",
      color: "#575757"
    }
  }, l)))));
}
function SubjectGrid() {
  const keys = Object.keys(window.SUBJECTS);
  return React.createElement("section", {
    style: {
      maxWidth: 1280,
      margin: "0 auto",
      padding: "72px 24px"
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: 32,
      gap: 24,
      flexWrap: "wrap"
    }
  }, React.createElement("div", null, React.createElement("h2", {
    style: {
      font: "600 40px/48px var(--font-sans)",
      letterSpacing: "0.0115rem",
      margin: 0
    }
  }, "Browse by subject"), React.createElement("p", {
    style: {
      font: "300 18px/28px var(--font-sans)",
      letterSpacing: "-0.005rem",
      color: "#575757",
      margin: "12px 0 0",
      maxWidth: 540
    }
  }, "Find lessons, units and resources for the subject you teach.")), React.createElement(Button, {
    variant: "secondary",
    iconRight: "arrow-right"
  }, "All subjects")), React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 16
    }
  }, keys.map(k => React.createElement(SubjectCard, {
    key: k,
    subject: k
  }))));
}
function SubjectCard({
  subject
}) {
  const [hover, setHover] = React.useState(false);
  const s = window.SUBJECTS[subject];
  return React.createElement("a", {
    href: "#",
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "18px 20px",
      background: "#fff",
      border: "2px solid #222",
      borderRadius: 12,
      boxShadow: hover ? "6px 6px 0 #222" : "4px 4px 0 #222",
      transform: hover ? "translate(-1px,-1px)" : "none",
      textDecoration: "none",
      color: "#222",
      transition: "box-shadow 120ms ease, transform 120ms ease"
    }
  }, React.createElement(SubjectChip, {
    subject,
    size: 48
  }), React.createElement("span", {
    style: {
      font: "600 20px/24px var(--font-sans)",
      letterSpacing: "0.0115rem",
      flex: 1
    }
  }, s.name), React.createElement(Icon, {
    name: "chevron-right",
    size: 22
  }));
}
function FeatureRow({
  flip,
  eyebrow,
  title,
  body,
  cta,
  bg,
  accent,
  children
}) {
  const text = React.createElement("div", null, React.createElement(Tag, {
    color: accent,
    style: {
      marginBottom: 16
    }
  }, eyebrow), React.createElement("h2", {
    style: {
      font: "600 40px/48px var(--font-sans)",
      letterSpacing: "0.0115rem",
      margin: "0 0 16px",
      color: "#222"
    }
  }, title), React.createElement("p", {
    style: {
      font: "300 18px/28px var(--font-sans)",
      letterSpacing: "-0.005rem",
      margin: "0 0 24px",
      maxWidth: 520,
      color: "#222"
    }
  }, body), React.createElement(Button, {
    variant: "primary",
    iconRight: "arrow-right"
  }, cta));
  return React.createElement("section", {
    style: {
      background: bg,
      borderTop: "2px solid #222",
      borderBottom: "2px solid #222"
    }
  }, React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: "0 auto",
      padding: "64px 24px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 56,
      alignItems: "center"
    }
  }, flip ? children : text, flip ? text : children));
}
function AilaFeature() {
  return React.createElement(FeatureRow, {
    eyebrow: "AI tools",
    accent: "lavender",
    bg: "#fff7cc",
    title: "Meet Aila, your AI lesson assistant",
    body: "You guide Aila to create and adapt national curriculum-aligned lessons in minutes. It gives you a solid foundation to build from and tailor to your pupils — you stay in control.",
    cta: "Try Aila free"
  }, React.createElement("div", {
    style: {
      background: "#fff",
      border: "3px solid #222",
      borderRadius: 16,
      boxShadow: "8px 8px 0 #222",
      padding: 24,
      transform: "rotate(-1deg)",
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 6
    }
  }, React.createElement(Icon, {
    name: "ai",
    size: 28
  }), React.createElement("div", {
    style: {
      font: "700 15px var(--font-sans)"
    }
  }, "Aila")), React.createElement("div", {
    style: {
      padding: 14,
      background: "#f9f9f9",
      borderRadius: 8,
      font: "300 15px/22px var(--font-sans)",
      letterSpacing: "-0.005rem"
    }
  }, "I'll draft a 50-minute lesson on tectonic hazards for Year 10. Want a starter quiz included?"), React.createElement("div", {
    style: {
      padding: 14,
      background: "#ffe555",
      borderRadius: 8,
      font: "300 15px/22px var(--font-sans)",
      letterSpacing: "-0.005rem",
      alignSelf: "flex-end",
      textAlign: "right",
      maxWidth: "82%"
    }
  }, "Yes please — and add exam-style questions at the end.")));
}
function CurriculumFeature() {
  return React.createElement(FeatureRow, {
    flip: true,
    eyebrow: "Curriculum plans",
    accent: "aqua",
    bg: "#fff",
    title: "Plan with confidence, key stage 1 to 4",
    body: "Explore expert-designed, quality-assured curriculum sequences — aligned to the national curriculum, with exam boards covered at secondary. Use them as a model or adapt them to your school.",
    cta: "Explore curriculum plans"
  }, React.createElement("div", {
    style: {
      background: "#e7f6f5",
      border: "3px solid #222",
      borderRadius: 16,
      boxShadow: "8px 8px 0 #222",
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, ["Unit 1 · Forces and motion", "Unit 2 · Energy stores", "Unit 3 · Electricity", "Unit 4 · Waves"].map((u, i) => React.createElement("div", {
    key: u,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      background: "#fff",
      border: "2px solid #222",
      borderRadius: 8
    }
  }, React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      flex: "0 0 28px",
      borderRadius: 100,
      background: i === 0 ? "#287c34" : "#fff",
      border: "2px solid #222",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      font: "700 13px/1 var(--font-sans)",
      color: i === 0 ? "#fff" : "#222"
    }
  }, i + 1), React.createElement("span", {
    style: {
      font: "700 16px/22px var(--font-sans)",
      letterSpacing: "-0.005rem"
    }
  }, u)))));
}
function PupilFeature() {
  return React.createElement(FeatureRow, {
    eyebrow: "Pupils",
    accent: "pink",
    bg: "#f5e9f2",
    title: "Send learning straight to pupils",
    body: "Set homework, revision and catch-up in seconds. Pupils take a starter quiz, watch the lesson, then an exit quiz — with real-time feedback. You see their progress, without adding to your workload.",
    cta: "See the pupil experience"
  }, React.createElement("div", {
    style: {
      background: "#fff",
      border: "3px solid #222",
      borderRadius: 16,
      boxShadow: "8px 8px 0 #222",
      padding: 24
    }
  }, React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginBottom: 16
    }
  }, ["Intro", "Quiz", "Video", "Worksheet", "Exit"].map((s, i) => React.createElement("div", {
    key: s,
    style: {
      flex: 1,
      textAlign: "center",
      padding: "8px 4px",
      borderRadius: 6,
      font: "700 12px/16px var(--font-sans)",
      letterSpacing: "-0.005rem",
      background: i < 2 ? "#bef2bd" : i === 2 ? "#222" : "#f2f2f2",
      color: i === 2 ? "#fff" : "#222"
    }
  }, s))), React.createElement("div", {
    style: {
      padding: 18,
      background: "#fff7cc",
      border: "2px solid #222",
      borderRadius: 8,
      font: "600 18px/24px var(--font-sans)",
      letterSpacing: "0.0115rem"
    }
  }, "Which process turns water vapour into liquid?"), React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginTop: 10
    }
  }, [["A", "Evaporation", false], ["B", "Condensation", true]].map(([l, t, ok]) => React.createElement("div", {
    key: l,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 14px",
      border: `2px solid ${ok ? "#287c34" : "#222"}`,
      borderRadius: 8,
      background: ok ? "#dff9de" : "#fff",
      font: "700 15px/20px var(--font-sans)"
    }
  }, React.createElement("span", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 100,
      background: ok ? "#287c34" : "#222",
      color: "#fff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      font: "700 14px/1 var(--font-sans)"
    }
  }, l), t)))));
}
function QuoteBand() {
  return React.createElement("section", {
    style: {
      background: "#222",
      padding: "64px 24px"
    }
  }, React.createElement("figure", {
    style: {
      maxWidth: 820,
      margin: "0 auto",
      textAlign: "center"
    }
  }, React.createElement("blockquote", {
    style: {
      font: "400 32px/42px var(--font-sans)",
      letterSpacing: "0.0115rem",
      color: "#fff",
      margin: 0
    }
  }, "“Incorporating Aila into my teaching has the potential to save me around 30 minutes per lesson — and enhance their quality too.”"), React.createElement("figcaption", {
    style: {
      font: "300 16px/24px var(--font-sans)",
      letterSpacing: "-0.005rem",
      color: "#ffe555",
      marginTop: 20
    }
  }, "James · Teacher, St Cuthbert Mayne School")));
}
function Newsletter() {
  return React.createElement("section", {
    style: {
      maxWidth: 1280,
      margin: "0 auto",
      padding: "64px 24px"
    }
  }, React.createElement("div", {
    style: {
      background: "#e3e9fb",
      border: "3px solid #222",
      borderRadius: 16,
      boxShadow: "8px 8px 0 #222",
      padding: "40px 44px",
      display: "grid",
      gridTemplateColumns: "1.2fr 1fr",
      gap: 40,
      alignItems: "center"
    }
  }, React.createElement("div", null, React.createElement("h2", {
    style: {
      font: "600 32px/40px var(--font-sans)",
      letterSpacing: "0.0115rem",
      margin: "0 0 8px"
    }
  }, "Get Oak in your inbox"), React.createElement("p", {
    style: {
      font: "300 16px/24px var(--font-sans)",
      letterSpacing: "-0.005rem",
      margin: 0,
      color: "#222"
    }
  }, "New lessons, curriculum updates and teaching tips — about once a month. No spam, ever.")), React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap"
    }
  }, React.createElement("input", {
    defaultValue: "",
    placeholder: "name@school.uk",
    style: {
      flex: 1,
      minWidth: 200,
      height: 56,
      padding: "0 16px",
      border: "2px solid #222",
      borderRadius: 4,
      font: "300 18px/24px var(--font-sans)",
      letterSpacing: "-0.005rem",
      background: "#fff",
      color: "#222"
    }
  }), React.createElement(Button, {
    variant: "primary",
    iconRight: "arrow-right",
    style: {
      height: 56
    }
  }, "Sign up"))));
}
Object.assign(window, {
  Hero,
  TrustBand,
  SubjectGrid,
  SubjectCard,
  AilaFeature,
  CurriculumFeature,
  PupilFeature,
  QuoteBand,
  Newsletter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/oak/Sections.jsx", error: String((e && e.message) || e) }); }

// ui_kits/oak/shared.jsx
try { (() => {
// Oak UI Kit — shared primitives. Uses LOCAL icons (assets/icons/*.svg) and Oak tokens.
// Exports: Icon, SubjectChip, Button, Tag, Nav, Footer

const ICON = n => `../../assets/icons/${n}.svg`;
const SUBJECTS = {
  english: {
    icon: "subject-english",
    bg: "#bef2bd",
    name: "English"
  },
  maths: {
    icon: "subject-maths",
    bg: "#a0b6f2",
    name: "Maths"
  },
  science: {
    icon: "subject-science",
    bg: "#b0e2de",
    name: "Science"
  },
  history: {
    icon: "subject-history",
    bg: "#deb7d5",
    name: "History"
  },
  geography: {
    icon: "subject-geography",
    bg: "#ffe555",
    name: "Geography"
  },
  art: {
    icon: "subject-art",
    bg: "#ffc8a6",
    name: "Art & design"
  },
  music: {
    icon: "subject-music",
    bg: "#ebfbeb",
    name: "Music"
  },
  computing: {
    icon: "subject-computing",
    bg: "#e3e9fb",
    name: "Computing"
  },
  french: {
    icon: "subject-french",
    bg: "#f5e9f2",
    name: "French"
  },
  spanish: {
    icon: "subject-spanish",
    bg: "#dff9de",
    name: "Spanish"
  },
  drama: {
    icon: "subject-drama",
    bg: "#fff2aa",
    name: "Drama"
  },
  pe: {
    icon: "subject-pe",
    bg: "#ffece0",
    name: "PE"
  }
};
function Icon({
  name,
  size = 24,
  invert = false,
  style
}) {
  return React.createElement("img", {
    src: ICON(name),
    alt: "",
    width: size,
    height: size,
    style: {
      display: "inline-block",
      verticalAlign: "middle",
      filter: invert ? "invert(1)" : "none",
      ...style
    }
  });
}
function SubjectChip({
  subject,
  size = 48
}) {
  const s = SUBJECTS[subject] || SUBJECTS.english;
  return React.createElement("span", {
    style: {
      width: size,
      height: size,
      flex: `0 0 ${size}px`,
      borderRadius: "50%",
      background: s.bg,
      border: "2px solid #222",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, React.createElement("img", {
    src: ICON(s.icon),
    width: size * 0.6,
    height: size * 0.6,
    alt: s.name
  }));
}

// OakButton — matches oak-components: 4px radius, 2px border, hover grey + lemon shadow.
function Button({
  children,
  variant = "primary",
  size = "md",
  iconRight,
  iconLeft,
  as = "button",
  href,
  onClick,
  style
}) {
  const [hover, setHover] = React.useState(false);
  const md = size === "md";
  const base = {
    font: `700 ${md ? "16px/20px" : "14px/20px"} var(--font-sans)`,
    letterSpacing: "-0.010em",
    padding: md ? "12px 16px" : "6px 12px",
    borderRadius: 4,
    border: "2px solid #222",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: md ? 8 : 4,
    textDecoration: "none",
    whiteSpace: "nowrap",
    transition: "background 120ms ease, box-shadow 120ms ease"
  };
  const dark = variant === "primary" || variant === "dark";
  const variants = {
    primary: {
      background: hover ? "#575757" : "#222",
      color: "#fff",
      boxShadow: hover ? "2px 2px 0 #ffe555" : "none"
    },
    secondary: {
      background: hover ? "#f2f2f2" : "#fff",
      color: "#222",
      boxShadow: hover ? "2px 2px 0 #ffe555" : "none"
    },
    inverted: {
      background: hover ? "#f2f2f2" : "#fff",
      color: "#222",
      border: "2px solid #fff"
    },
    dark: {
      background: hover ? "#575757" : "#222",
      color: "#fff",
      boxShadow: hover ? "2px 2px 0 #ffe555" : "none"
    }
  };
  const Tag = as === "a" ? "a" : "button";
  return React.createElement(Tag, {
    href,
    onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      ...variants[variant],
      ...style
    }
  }, iconLeft && React.createElement(Icon, {
    name: iconLeft,
    size: md ? 24 : 20,
    invert: dark
  }), React.createElement("span", {
    style: {
      textDecoration: hover && variant !== "primary" && variant !== "dark" ? "underline" : "none"
    }
  }, children), iconRight && React.createElement(Icon, {
    name: iconRight,
    size: md ? 24 : 20,
    invert: dark
  }));
}

// OakTagFunctional — 4px radius, 16/20 regular, pastel bg, optional 20px icon.
function Tag({
  children,
  color = "lemon",
  icon,
  style
}) {
  const bg = {
    lemon: "#ffe555",
    mint: "#bef2bd",
    aqua: "#b0e2de",
    lavender: "#a0b6f2",
    pink: "#deb7d5",
    grey: "#e4e4e4",
    white: "#fff"
  }[color] || "#ffe555";
  return React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      height: 28,
      padding: "4px 8px",
      borderRadius: 4,
      background: bg,
      border: color === "white" ? "1px solid #222" : "none",
      font: "400 16px/20px var(--font-sans)",
      letterSpacing: "0.0115rem",
      color: "#222",
      ...style
    }
  }, icon && React.createElement(Icon, {
    name: icon,
    size: 20
  }), children);
}
function Nav({
  active = "Subjects"
}) {
  const items = ["Subjects", "Curriculum", "AI tools", "Pupils", "Support"];
  return React.createElement("header", {
    style: {
      borderBottom: "2px solid #222",
      background: "#fff"
    }
  }, React.createElement("div", {
    style: {
      background: "#ffe555",
      borderBottom: "2px solid #222",
      padding: "8px 24px",
      textAlign: "center",
      font: "700 14px/20px var(--font-sans)",
      letterSpacing: "-0.005rem",
      color: "#222"
    }
  }, "Free, adaptable resources for every teacher — and always will be."), React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: "0 auto",
      height: 76,
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      gap: 28
    }
  }, React.createElement("a", {
    href: "#",
    style: {
      display: "flex",
      alignItems: "center"
    }
  }, React.createElement("img", {
    src: "../../assets/logo-full-official.svg",
    alt: "Oak National Academy",
    style: {
      height: 36
    }
  })), React.createElement("nav", {
    style: {
      display: "flex",
      gap: 22,
      flex: 1
    }
  }, items.map(it => React.createElement("a", {
    key: it,
    href: "#",
    style: {
      font: "700 16px/20px var(--font-sans)",
      letterSpacing: "-0.005rem",
      color: "#222",
      textDecoration: "none",
      padding: "8px 0",
      borderBottom: active === it ? "4px solid #ffe555" : "4px solid transparent"
    }
  }, it))), React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    iconLeft: "search",
    style: {
      height: 44,
      padding: "0 14px"
    }
  }, "Search"), React.createElement(Button, {
    variant: "primary",
    size: "sm",
    style: {
      height: 44,
      padding: "0 18px"
    }
  }, "Sign in")));
}
function Footer() {
  const cols = [["Pupils", ["Browse by subject", "Browse by year", "Starter quizzes", "Exit quizzes"]], ["Teachers", ["Lessons & resources", "Curriculum plans", "AI tools", "Support hub"]], ["About", ["Who we are", "Our mission", "Blog", "Careers", "Contact us"]]];
  return React.createElement("footer", {
    style: {
      background: "#222",
      color: "#fff",
      padding: "64px 24px 40px"
    }
  }, React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr 1fr",
      gap: 48
    }
  }, React.createElement("div", null, React.createElement("img", {
    src: "../../assets/logo-full-official.svg",
    style: {
      height: 40,
      filter: "invert(1) brightness(2)"
    },
    alt: "Oak"
  }), React.createElement("p", {
    style: {
      font: "300 15px/24px var(--font-sans)",
      letterSpacing: "-0.005rem",
      marginTop: 16,
      maxWidth: 320,
      color: "#cacaca"
    }
  }, "We help schools deliver a world-class curriculum for every pupil. Free, adaptable resources and AI tools, created by experts and tested by teachers."), React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginTop: 20
    }
  }, ["facebook", "x", "instagram", "linkedin"].map(s => React.createElement("span", {
    key: s,
    style: {
      width: 40,
      height: 40,
      borderRadius: 100,
      border: "2px solid #575757",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, React.createElement(Icon, {
    name: s,
    size: 20,
    invert: true
  }))))), cols.map(([hd, links]) => React.createElement("div", {
    key: hd
  }, React.createElement("div", {
    style: {
      font: "700 12px/16px var(--font-sans)",
      marginBottom: 14,
      color: "#ffe555",
      letterSpacing: "0.06em",
      textTransform: "uppercase"
    }
  }, hd), React.createElement("ul", {
    style: {
      listStyle: "none",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, links.map(l => React.createElement("li", {
    key: l
  }, React.createElement("a", {
    href: "#",
    style: {
      color: "#fff",
      font: "300 15px/20px var(--font-sans)",
      letterSpacing: "-0.005rem",
      textDecoration: "none"
    }
  }, l))))))), React.createElement("div", {
    style: {
      maxWidth: 1280,
      margin: "48px auto 0",
      paddingTop: 24,
      borderTop: "1px solid #575757",
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
      font: "300 13px/18px var(--font-sans)",
      color: "#808080"
    }
  }, React.createElement("div", null, "© 2026 Oak National Academy Limited. Resources on an open licence (OGL v3.0)."), React.createElement("div", null, "Terms · Privacy · Cookies · Accessibility")));
}
Object.assign(window, {
  Icon,
  SubjectChip,
  Button,
  Tag,
  Nav,
  Footer,
  SUBJECTS,
  ICON
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/oak/shared.jsx", error: String((e && e.message) || e) }); }

})();
