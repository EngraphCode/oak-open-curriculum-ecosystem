// OakButton — mirrors oak-components InternalShadowRectButton. Consumes the SAME
// tier-3 tokens as .oak-btn in components.css, so class library and bundle cannot drift.
function oakBtnIconUrl(name) {
  const s = document.querySelector('script[src*="_ds_bundle.js"]');
  return s ? new URL('assets/icons/' + name + '.svg', s.src).href : 'assets/icons/' + name + '.svg';
}
export function OakButton({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  disabled = false,
  href,
  onClick,
  type = 'button',
  style,
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  const md = size === 'md';
  const onDark = variant === 'primary';
  const base = {
    minHeight: md ? 'var(--btn-min-h)' : 'var(--btn-min-h-sm)',
    boxSizing: 'border-box',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: md ? 'var(--btn-pad)' : 'var(--btn-pad-sm)',
    gap: md ? 'var(--btn-gap)' : 'var(--btn-gap-sm)',
    borderRadius: 'var(--btn-radius)',
    font:
      (md ? 'var(--weight-semibold) var(--font-size-3)' : 'var(--weight-bold) var(--font-size-2)') +
      '/var(--leading-20) var(--font-sans)',
    letterSpacing: md ? 'var(--tracking-heading)' : 'var(--tracking-body)',
    border: 'var(--btn-border) solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition:
      'background var(--motion-quick) var(--ease-standard), box-shadow var(--motion-quick) var(--ease-standard)',
  };
  const v =
    {
      primary: {
        background: disabled
          ? 'var(--bg-btn-disabled)'
          : hover
            ? 'var(--bg-btn-primary-hover)'
            : 'var(--bg-btn-primary)',
        borderColor: disabled
          ? 'var(--bg-btn-disabled)'
          : hover
            ? 'var(--bg-btn-primary-hover)'
            : 'var(--bg-btn-primary)',
        color: disabled ? 'var(--text-btn-disabled)' : 'var(--text-btn-primary)',
      },
      secondary: {
        background:
          hover && !disabled ? 'var(--bg-btn-secondary-hover)' : 'var(--bg-btn-secondary)',
        borderColor: disabled ? 'var(--border-neutral-lighter)' : 'var(--border-primary)',
        color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
      },
      inverted: {
        background: hover && !disabled ? 'var(--bg-neutral)' : 'var(--bg-primary)',
        borderColor: hover && !disabled ? 'var(--bg-neutral)' : 'var(--bg-primary)',
        color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
      },
    }[variant] || {};
  const shadow = disabled
    ? 'none'
    : press
      ? 'var(--shadow-press)'
      : focus
        ? 'var(--focus-ring)'
        : hover && variant !== 'inverted'
          ? 'var(--shadow-accent)'
          : 'none';
  const iconSize = md ? 'var(--size-icon-m)' : 'var(--size-icon-s)';
  const iconFilter = onDark
    ? disabled
      ? 'var(--filter-icon-on-btn-disabled)'
      : 'var(--filter-icon-on-btn-primary)'
    : 'var(--filter-icon)';
  const icon = (n) => (
    <img
      src={oakBtnIconUrl(n)}
      alt=""
      style={{ width: iconSize, height: iconSize, flex: '0 0 ' + iconSize, filter: iconFilter }}
    />
  );
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      // Anchors ignore the disabled attribute: a disabled link drops its href
      // and announces via aria-disabled; only real buttons get native disabled.
      href={href && !disabled ? href : undefined}
      disabled={href ? undefined : disabled}
      aria-disabled={href && disabled ? 'true' : undefined}
      type={href ? undefined : type}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setPress(false);
      }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      // Transparent (never none) while focused, so Windows forced-colors mode
      // draws its own visible ring over the box-shadow focus ring.
      style={{
        ...base,
        ...v,
        boxShadow: shadow,
        outline: focus ? '2px solid transparent' : 'none',
        ...style,
      }}
    >
      {iconLeft ? icon(iconLeft) : null}
      <span style={{ textDecoration: hover && !disabled ? 'underline' : 'none' }}>{children}</span>
      {iconRight ? icon(iconRight) : null}
    </Tag>
  );
}
