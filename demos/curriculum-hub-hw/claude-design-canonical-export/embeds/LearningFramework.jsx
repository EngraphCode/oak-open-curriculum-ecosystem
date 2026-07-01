// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// animations.jsx
// Reusable animation starter: Stage, Timeline, Sprite, easing helpers.
// Exports (to window): Stage, Sprite, PlaybackBar, TextSprite, ImageSprite, RectSprite,
//   useTime, useTimeline, useSprite, Easing, interpolate, animate, clamp.
//
// Usage (in an HTML file that loads React + Babel):
//
//   <Stage width={1280} height={720} duration={10} background="#f6f4ef">
//     <MyScene />
//   </Stage>
//
// <Stage> auto-scales to the viewport and provides the scrubber, play/pause,
// ←/→ seek, space, and 0-to-reset controls, and persists the playhead.
// Inside <Stage>, any child can call useTime() to read the current
// playhead (seconds). Or wrap content in <Sprite start={1} end={4}>...</Sprite>
// to only render during that window -- children receive a `localTime` and
// `progress` via the useSprite() hook. Use Easing + interpolate()/animate()
// for tweens; TextSprite / ImageSprite / RectSprite have built-in entry/exit.
// Build YOUR scenes by composing Sprites inside a Stage.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

// ── Easing functions (hand-rolled, Popmotion-style) ─────────────────────────
// All easings take t ∈ [0,1] and return eased t ∈ [0,1] (may overshoot for back/elastic).
const Easing = {
  linear: (t) => t,

  // Quad
  easeInQuad:    (t) => t * t,
  easeOutQuad:   (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic
  easeInCubic:    (t) => t * t * t,
  easeOutCubic:   (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),

  // Quart
  easeInQuart:    (t) => t * t * t * t,
  easeOutQuart:   (t) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t),

  // Expo
  easeInExpo:  (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
    return 1 - 0.5 * Math.pow(2, -20 * t + 10);
  },

  // Sine
  easeInSine:    (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine:   (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Back (overshoot)
  easeOutBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158, c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  // Elastic
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

// ── Core interpolation helpers ──────────────────────────────────────────────

// Clamp a value to [min, max]
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// interpolate([0, 0.5, 1], [0, 100, 50], ease?) -> fn(t)
// Popmotion-style: linearly maps t across input keyframes to output values,
// with optional easing per segment (single fn or array of fns).
function interpolate(input, output, ease = Easing.linear) {
  return (t) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? (ease[i] || Easing.linear) : ease;
        const eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}

// animate({from, to, start, end, ease})(t) — simpler single-segment tween.
// Returns `from` before `start`, `to` after `end`.
function animate({ from = 0, to = 1, start = 0, end = 1, ease = Easing.easeInOutCubic }) {
  return (t) => {
    if (t <= start) return from;
    if (t >= end) return to;
    const local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}

// ── Timeline context ────────────────────────────────────────────────────────

const TimelineContext = React.createContext({ time: 0, duration: 10, playing: false });

const useTime = () => React.useContext(TimelineContext).time;
const useTimeline = () => React.useContext(TimelineContext);

// ── Sprite ──────────────────────────────────────────────────────────────────
// Renders children only when the playhead is inside [start, end]. Provides
// a sub-context with `localTime` (seconds since start) and `progress` (0..1).
//
//   <Sprite start={2} end={5}>
//     {({ localTime, progress }) => <Thing x={progress * 100} />}
//   </Sprite>
//
// Or as a plain wrapper — children can call useSprite() themselves.

const SpriteContext = React.createContext({ localTime: 0, progress: 0, duration: 0 });
const useSprite = () => React.useContext(SpriteContext);

function Sprite({ start = 0, end = Infinity, children, keepMounted = false }) {
  const { time } = useTimeline();
  const visible = time >= start && time <= end;
  if (!visible && !keepMounted) return null;

  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress = duration > 0 && isFinite(duration)
    ? clamp(localTime / duration, 0, 1)
    : 0;

  const value = { localTime, progress, duration, visible };

  return (
    <SpriteContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </SpriteContext.Provider>
  );
}

// ── Sample sprite components ────────────────────────────────────────────────

// TextSprite: fades/slides text in on entry, holds, then fades out on exit.
// Props: text, x, y, size, color, font, entryDur, exitDur, align
function TextSprite({
  text,
  x = 0, y = 0,
  size = 48,
  color = '#111',
  font = 'Inter, system-ui, sans-serif',
  weight = 600,
  entryDur = 0.45,
  exitDur = 0.35,
  entryEase = Easing.easeOutBack,
  exitEase = Easing.easeInCubic,
  align = 'left',
  letterSpacing = '-0.01em',
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let ty = 0;

  if (localTime < entryDur) {
    const t = entryEase(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    ty = (1 - t) * 16;
  } else if (localTime > exitStart) {
    const t = exitEase(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    ty = -t * 8;
  }

  const translateX = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      transform: `translate(${translateX}, ${ty}px)`,
      opacity,
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing,
      whiteSpace: 'pre',
      lineHeight: 1.1,
      willChange: 'transform, opacity',
    }}>
      {text}
    </div>
  );
}

// ImageSprite: scales + fades in; optional Ken Burns drift during hold.
function ImageSprite({
  src,
  x = 0, y = 0,
  width = 400, height = 300,
  entryDur = 0.6,
  exitDur = 0.4,
  kenBurns = false,
  kenBurnsScale = 1.08,
  radius = 12,
  fit = 'cover',
  placeholder = null, // {label: string} for striped placeholder
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let scale = 1;

  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    scale = 0.96 + 0.04 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = (kenBurns ? kenBurnsScale : 1) + 0.02 * t;
  } else if (kenBurns) {
    const holdSpan = exitStart - entryDur;
    const holdT = holdSpan > 0 ? (localTime - entryDur) / holdSpan : 0;
    scale = 1 + (kenBurnsScale - 1) * holdT;
  }

  const content = placeholder ? (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'repeating-linear-gradient(135deg, #e9e6df 0 10px, #dcd8cf 10px 20px)',
      color: '#6b6458',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 13,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {placeholder.label || 'image'}
    </div>
  ) : (
    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }} />
  );

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      borderRadius: radius,
      overflow: 'hidden',
      willChange: 'transform, opacity',
    }}>
      {content}
    </div>
  );
}

// RectSprite: simple rectangle that animates position/size/color via props.
// Useful demo primitive — takes a `render` fn for per-frame customization.
function RectSprite({
  x = 0, y = 0,
  width = 100, height = 100,
  color = '#111',
  radius = 8,
  entryDur = 0.4,
  exitDur = 0.3,
  render, // optional: (ctx) => style overrides
}) {
  const spriteCtx = useSprite();
  const { localTime, duration } = spriteCtx;
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let scale = 1;

  if (localTime < entryDur) {
    const t = Easing.easeOutBack(clamp(localTime / entryDur, 0, 1));
    opacity = clamp(localTime / entryDur, 0, 1);
    scale = 0.4 + 0.6 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInQuad(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = 1 - 0.15 * t;
  }

  const overrides = render ? render(spriteCtx) : {};

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      background: color,
      borderRadius: radius,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      willChange: 'transform, opacity',
      ...overrides,
    }} />
  );
}


function Stage({
  width = 1280,
  height = 720,
  duration = 10,
  background = '#f6f4ef',
  fps = 60,
  loop = true,
  autoplay = true,
  persistKey = 'animstage',
  children,
}) {
  const [time, setTime] = React.useState(() => {
    try {
      const v = parseFloat(localStorage.getItem(persistKey + ':t') || '0');
      return isFinite(v) ? clamp(v, 0, duration) : 0;
    } catch { return 0; }
  });
  const [playing, setPlaying] = React.useState(autoplay);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(1);

  const stageRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const lastTsRef = React.useRef(null);

  // Persist playhead
  React.useEffect(() => {
    try { localStorage.setItem(persistKey + ':t', String(time)); } catch {}
  }, [time, persistKey]);

  // Auto-scale to fit viewport
  React.useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const measure = () => {
      const barH = 44; // playback bar height
      const s = Math.min(
        el.clientWidth / width,
        (el.clientHeight - barH) / height
      );
      setScale(Math.max(0.05, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [width, height]);

  // Animation loop
  React.useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      return;
    }
    const step = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setTime((t) => {
        let next = t + dt;
        if (next >= duration) {
          if (loop) next = next % duration;
          else { next = duration; setPlaying(false); }
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [playing, duration, loop]);

  // Keyboard: space = play/pause, ← → = seek
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying(p => !p);
      } else if (e.code === 'ArrowLeft') {
        setTime(t => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.code === 'ArrowRight') {
        setTime(t => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.key === '0' || e.code === 'Home') {
        setTime(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration]);

  const displayTime = hoverTime != null ? hoverTime : time;

  const ctxValue = React.useMemo(
    () => ({ time: displayTime, duration, playing, setTime, setPlaying }),
    [displayTime, duration, playing]
  );

  return (
    <div
      ref={stageRef}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        background: '#0a0a0a',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Canvas area — vertically centered in remaining space */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        <div
          ref={canvasRef}
          style={{
            width, height,
            background,
            position: 'relative',
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            flexShrink: 0,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}
        >
          <TimelineContext.Provider value={ctxValue}>
            {children}
          </TimelineContext.Provider>
        </div>
      </div>

      {/* Playback bar — stacked below canvas, never overlapping */}
      <PlaybackBar
        time={displayTime}
        actualTime={time}
        duration={duration}
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        onReset={() => { setTime(0); }}
        onSeek={(t) => setTime(t)}
        onHover={(t) => setHoverTime(t)}
      />
    </div>
  );
}

// ── Playback bar ────────────────────────────────────────────────────────────
// Play/pause, return-to-begin, scrub track, time display.
// Uses fixed-width time fields so layout doesn't thrash.

function PlaybackBar({ time, duration, playing, onPlayPause, onReset, onSeek, onHover }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);

  const timeFromEvent = React.useCallback((e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return x * duration;
  }, [duration]);

  const onTrackMove = (e) => {
    if (!trackRef.current) return;
    const t = timeFromEvent(e);
    if (dragging) {
      onSeek(t);
    } else {
      onHover(t);
    }
  };

  const onTrackLeave = () => {
    if (!dragging) onHover(null);
  };

  const onTrackDown = (e) => {
    setDragging(true);
    const t = timeFromEvent(e);
    onSeek(t);
    onHover(null);
  };

  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = (e) => {
      if (!trackRef.current) return;
      const t = timeFromEvent(e);
      onSeek(t);
    };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
    };
  }, [dragging, timeFromEvent, onSeek]);

  const pct = duration > 0 ? (time / duration) * 100 : 0;
  const fmt = (t) => {
    const total = Math.max(0, t);
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    const cs = Math.floor((total * 100) % 100);
    return `${String(m).padStart(1, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  const mono = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 16px',
      background: 'rgba(20,20,20,0.92)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      width: '100%',
      maxWidth: 680,
      alignSelf: 'center',

      borderRadius: 8,
      color: '#f6f4ef',
      fontFamily: 'Inter, system-ui, sans-serif',
      userSelect: 'none',
      flexShrink: 0,
    }}>
      <IconButton onClick={onReset} title="Return to start (0)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 2v10M12 2L5 7l7 5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
        </svg>
      </IconButton>
      <IconButton onClick={onPlayPause} title="Play/pause (space)">
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="3" y="2" width="3" height="10" fill="currentColor"/>
            <rect x="8" y="2" width="3" height="10" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 2l9 5-9 5V2z" fill="currentColor"/>
          </svg>
        )}
      </IconButton>

      {/* Current time: fixed width so it doesn't thrash */}
      <div style={{
        fontFamily: mono,
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        width: 64, textAlign: 'right',
        color: '#f6f4ef',
      }}>
        {fmt(time)}
      </div>

      {/* Scrub track */}
      <div
        ref={trackRef}
        onMouseMove={onTrackMove}
        onMouseLeave={onTrackLeave}
        onMouseDown={onTrackDown}
        style={{
          flex: 1,
          height: 22,
          position: 'relative',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center',
        }}
      >
        <div style={{
          position: 'absolute',
          left: 0, right: 0, height: 4,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 2,
        }}/>
        <div style={{
          position: 'absolute',
          left: 0, width: `${pct}%`, height: 4,
          background: 'oklch(72% 0.12 250)',
          borderRadius: 2,
        }}/>
        <div style={{
          position: 'absolute',
          left: `${pct}%`, top: '50%',
          width: 12, height: 12,
          marginLeft: -6, marginTop: -6,
          background: '#fff',
          borderRadius: 6,
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        }}/>
      </div>

      {/* Duration: fixed width */}
      <div style={{
        fontFamily: mono,
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        width: 64, textAlign: 'left',
        color: 'rgba(246,244,239,0.55)',
      }}>
        {fmt(duration)}
      </div>
    </div>
  );
}

function IconButton({ children, onClick, title }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6,
        color: '#f6f4ef',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 120ms',
      }}
    >
      {children}
    </button>
  );
}


Object.assign(window, {
  Easing, interpolate, animate, clamp,
  TimelineContext, useTime, useTimeline,
  Sprite, SpriteContext, useSprite,
  TextSprite, ImageSprite, RectSprite,
  Stage, PlaybackBar,
});



// ═══════════════════════════════════════════════════
// SCENES
// ═══════════════════════════════════════════════════

// ── Oak Learning Framework — animated explainer scenes ──────────────────────
// Relies on globals from animations.jsx (Stage, Sprite, useTime, Easing, clamp, interpolate).

const FONT = 'Lexend, system-ui, -apple-system, sans-serif';
const BLACK = '#222222';
const GREEN = '#287c34';
const GREEN_DEEP = '#15401d';
const GREY40 = '#cacaca';
const GREY60 = '#575757';
const LEMON = '#ffe555';
const LEMON30 = '#fff7cc';
const MINT30 = '#ebfbeb';
const MINT = '#bef2bd';
const WHITE = '#ffffff';
const SUBDUED = '#575757';

const STAGES = [
  { key: 'Fit it', n: 1, color: GREY40, ink: BLACK, phase: 'Before the lesson',
    desc: 'Ensuring pupils are learning the right knowledge.',
    long: 'The teacher fits learning to the pupil — working out the next thing pupils need to learn, based on what they already know.',
    features: ['Curriculum sequence & information', 'Unit & lesson information on the website'] },
  { key: 'Own it', n: 2, color: GREEN, ink: WHITE, phase: 'In a lesson',
    desc: 'Ensuring pupils are motivated to learn.',
    long: 'We pay attention to what we’re motivated to do. Build motivation by engineering success and piquing pupils’ interest.',
    features: ['Prior knowledge starter quiz', 'Motivational nudges, enthusiasm & tone', 'An accessible web experience'] },
  { key: 'Frame it', n: 3, color: GREEN, ink: WHITE, phase: 'In a lesson',
    desc: 'Ensuring pupils build on and link to existing knowledge.',
    long: 'New knowledge is built on prior knowledge — like laying bricks. Prime pupils to bring to mind what they already know.',
    features: ['Prior knowledge starter quiz', 'Explanation linking new to prior learning'] },
  { key: 'Get it', n: 4, color: GREEN, ink: WHITE, phase: 'In a lesson',
    desc: 'Helping pupils to understand the knowledge.',
    long: 'Break knowledge into manageable chunks and explain it — using modelling and analogy so pupils think hard about it.',
    features: ['Explicit explanation phases', 'Modelling'] },
  { key: 'Use it', n: 5, color: GREEN, ink: WHITE, phase: 'In a lesson',
    desc: 'Ensuring pupils practise application of the knowledge.',
    long: 'Practice — where pupils put their new learning to use and make it their own.',
    features: ['Explicit practice phases', 'Quizzing'] },
  { key: 'Keep it', n: 6, color: GREEN_DEEP, ink: WHITE, phase: 'Over time',
    desc: 'Ensuring the knowledge sticks.',
    long: 'The most effective learning takes months to secure. We forget naturally — so we revisit knowledge at spaced intervals to boost retention.',
    features: ['Implicit retrieval throughout a unit', 'Unit-level quiz'] },
  { key: 'Check it', n: 7, color: GREY60, ink: WHITE, phase: 'Throughout',
    desc: 'Checking and course-correcting throughout.',
    long: 'Teachers check understanding and respond to what they find — and this happens alongside every other stage, enclosing the whole model.',
    features: ['Checks for understanding', 'Explicit feedback phases', 'Model task responses', 'Assessment exit quiz'] },
];

// ── ring geometry ───────────────────────────────────────────────────────────
const RING_START = -150;   // degrees (screen space; 0=right, 90=down)
const RING_ARC = 300;      // total sweep, clockwise
const SEG = RING_ARC / 7;
function polar(cx, cy, r, deg) {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
function chevronPath(cx, cy, ri, ro, a0, a1, pt) {
  const rmid = (ri + ro) / 2;
  const p1 = polar(cx, cy, ri, a0);
  const p2 = polar(cx, cy, ri, a1);
  const p3 = polar(cx, cy, rmid, a1 + pt);
  const p4 = polar(cx, cy, ro, a1);
  const p5 = polar(cx, cy, ro, a0);
  const p6 = polar(cx, cy, rmid, a0 + pt);
  return `M${p1[0]},${p1[1]} A${ri},${ri} 0 0 1 ${p2[0]},${p2[1]} L${p3[0]},${p3[1]} L${p4[0]},${p4[1]} A${ro},${ro} 0 0 0 ${p5[0]},${p5[1]} L${p6[0]},${p6[1]} Z`;
}

// timing windows for the seven-stage walkthrough (global seconds)
const WALK = [
  [23, 32], [32, 42], [42, 51], [51, 60], [60, 68], [68, 80], [80, 93],
];
const ASSEMBLE_FROM = 16, ASSEMBLE_TO = 22;

// ── small fade helper ────────────────────────────────────────────────────────
function Item({ start, end, dy = 20, children, style = {} }) {
  const t = useTime();
  const inDur = 0.55, outDur = 0.4;
  let op = 0, ty = dy;
  if (t >= start) {
    const e = clamp((t - start) / inDur, 0, 1);
    const k = Easing.easeOutCubic(e);
    op = k; ty = (1 - k) * dy;
  }
  if (end != null && t > end - outDur) {
    const e = clamp((t - (end - outDur)) / outDur, 0, 1);
    op = (1 - e) * op + 0; ty = ty - e * 10;
    op = Math.min(op, 1 - e);
  }
  return (
    <div style={{ opacity: op, transform: `translateY(${ty}px)`, willChange: 'transform,opacity', ...style }}>
      {children}
    </div>
  );
}

// full-bleed coloured backdrop that fades with a window
function Backdrop({ start, end, color }) {
  const t = useTime();
  let op = 0;
  const inD = 0.6, outD = 0.6;
  if (t >= start - inD) op = clamp((t - (start - inD)) / inD, 0, 1);
  if (end != null && t > end) op = clamp(1 - (t - end) / outD, 0, 1);
  if (t < start - inD || (end != null && t > end + outD)) op = 0;
  return <div style={{ position: 'absolute', inset: 0, background: color, opacity: op }} />;
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 1 — Intro / title (0–6)
function IntroScene() {
  return (
    <Sprite start={0} end={6.4} keepMounted>
      <Backdrop start={0} end={6} color={LEMON30} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Item start={0.2} end={6} dy={14}>
          <img src="assets/logo-acorn-official.svg" style={{ width: 96, height: 'auto', marginBottom: 34 }} />
        </Item>
        <Item start={0.5} end={6} dy={22}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 96, color: BLACK,
            letterSpacing: '0.01em', lineHeight: 1.04 }}>
            The learning framework
          </div>
        </Item>
        <Item start={0.9} end={6}>
          <div style={{ width: 240, height: 10, background: LEMON, borderRadius: 100, margin: '26px 0' }} />
        </Item>
        <Item start={1.2} end={6} dy={16}>
          <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: 38, color: SUBDUED,
            letterSpacing: '-0.005em' }}>
            An evidence-informed model of learning that guides every Oak lesson
          </div>
        </Item>
        <Item start={2.0} end={6} dy={10}>
          <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: 22, color: '#808080',
            marginTop: 40 }}>
            Adapted from McCrea, P. — Developing Expert Teaching (2023)
          </div>
        </Item>
      </div>
    </Sprite>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 2 — Premise (6.4–16)
function PremiseScene() {
  return (
    <Sprite start={6.4} end={16.2} keepMounted>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 220px' }}>
        <Item start={6.7} end={15.9} dy={26}>
          <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: 66, color: BLACK,
            lineHeight: 1.18, letterSpacing: '-0.01em' }}>
            Learning isn’t a single moment.
          </div>
        </Item>
        <Item start={8.6} end={15.9} dy={26}>
          <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: 66, color: BLACK,
            lineHeight: 1.18, letterSpacing: '-0.01em', marginTop: 14 }}>
            It’s a sequence of <span style={{ fontWeight: 700, color: GREEN }}>seven stages</span>,
            unfolding over time.
          </div>
        </Item>
        <Item start={11.6} end={15.9} dy={20}>
          <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: 38, color: SUBDUED,
            marginTop: 46, letterSpacing: '-0.005em' }}>
            Miss one — or rush it — and there’s a real risk no learning happens at all.
          </div>
        </Item>
      </div>
    </Sprite>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 3 — The ring + seven-stage walkthrough (16–94)
function FeatureRow({ label, color, ink }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
      <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 100,
        background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: color === GREY40 ? '2px solid #222' : 'none' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8.5l3.2 3.2L13 4.5" stroke={ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span style={{ fontFamily: FONT, fontWeight: 300, fontSize: 26, color: BLACK, letterSpacing: '-0.005em' }}>{label}</span>
    </div>
  );
}

function StageCard({ stage, active }) {
  return (
    <div style={{ position: 'absolute', left: 880, top: 150, width: 940 }}>
      <Item start={active[0]} end={active[1]} dy={24}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12,
          background: stage.color, color: stage.ink, fontFamily: FONT, fontWeight: 700,
          fontSize: 22, letterSpacing: '0.04em', textTransform: 'uppercase',
          padding: '8px 18px', borderRadius: 100,
          border: stage.color === GREY40 ? '2px solid #222' : 'none' }}>
          {stage.phase}
        </div>
      </Item>
      <Item start={active[0] + 0.12} end={active[1]} dy={26}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 26 }}>
          <span style={{ flexShrink: 0, width: 92, height: 92, borderRadius: 100, background: stage.color,
            color: stage.ink, fontFamily: FONT, fontWeight: 700, fontSize: 46,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: stage.color === GREY40 ? '3px solid #222' : 'none',
            boxShadow: '4px 4px 0 ' + LEMON }}>
            {stage.n}
          </span>
          <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: 78, color: BLACK, letterSpacing: '0.005em' }}>
            {stage.key}
          </span>
        </div>
      </Item>
      <Item start={active[0] + 0.24} end={active[1]} dy={22}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 34, color: BLACK,
          marginTop: 30, lineHeight: 1.25, letterSpacing: '-0.005em' }}>
          {stage.desc}
        </div>
      </Item>
      <Item start={active[0] + 0.36} end={active[1]} dy={18}>
        <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: 27, color: SUBDUED,
          marginTop: 16, lineHeight: 1.5, letterSpacing: '-0.005em', maxWidth: 880 }}>
          {stage.long}
        </div>
      </Item>

      {stage.key === 'Keep it' && (
        <Item start={active[0] + 0.5} end={active[1]} dy={16}>
          <div style={{ marginTop: 22, background: WHITE, border: '3px solid ' + BLACK,
            borderRadius: 16, boxShadow: '4px 4px 0 ' + LEMON, padding: '16px 20px 10px', maxWidth: 880 }}>
            <img src="assets/retention-curve.png" style={{ width: '100%', height: 'auto', display: 'block' }} />
            <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: 21, color: SUBDUED, marginTop: 6 }}>
              Each spaced retrieval boosts the retention curve back up.
            </div>
          </div>
        </Item>
      )}

      {stage.key !== 'Keep it' && (
        <Item start={active[0] + 0.5} end={active[1]} dy={16}>
          <div style={{ marginTop: 26 }}>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20, color: '#808080',
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              In Oak lessons
            </div>
            {stage.features.map((f, i) => (
              <FeatureRow key={i} label={f} color={stage.color} ink={stage.ink} />
            ))}
          </div>
        </Item>
      )}
    </div>
  );
}

function RingScene() {
  const t = useTime();
  const cx = 330, cy = 330, ri = 150, ro = 256, pt = SEG * 0.34;

  // active stage index from windows
  let active = -1;
  for (let i = 0; i < WALK.length; i++) {
    if (t >= WALK[i][0] && t < WALK[i][1]) { active = i; break; }
  }
  // ring scene visible window
  const visible = t >= ASSEMBLE_FROM - 0.6 && t <= 94.2;
  let sceneOp = 1;
  if (t < ASSEMBLE_FROM) sceneOp = clamp((t - (ASSEMBLE_FROM - 0.6)) / 0.6, 0, 1);
  if (t > 93.4) sceneOp = clamp(1 - (t - 93.4) / 0.8, 0, 1);
  if (!visible) return null;

  // whether we are in "assemble + label" mode (before first stage) vs walkthrough
  const inWalk = t >= WALK[0][0] - 0.3;

  const segs = STAGES.map((s, i) => {
    const a0 = RING_START + i * SEG;
    const a1 = RING_START + (i + 1) * SEG;
    const d = chevronPath(cx, cy, ri, ro, a0, a1, pt);
    // appear stagger during assemble
    const appearStart = ASSEMBLE_FROM + i * 0.55;
    const appear = clamp((t - appearStart) / 0.5, 0, 1);
    let op;
    if (!inWalk) {
      op = Easing.easeOutCubic(appear);
    } else {
      const dimT = clamp((t - (WALK[0][0] - 0.3)) / 0.6, 0, 1);
      const target = i === active ? 1 : 0.15;
      op = 1 + (target - 1) * dimT;
    }
    const isActive = inWalk && i === active;
    return { d, op, isActive, color: s.color, i };
  });

  // center label
  const centerName = active >= 0 ? STAGES[active].key : '7 stages';
  const centerSub = active >= 0 ? ('Stage ' + STAGES[active].n + ' of 7') : 'for learning to happen';

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: sceneOp }}>
      <svg viewBox="0 0 660 660" style={{ position: 'absolute', left: 70, top: 200, width: 700, height: 700, overflow: 'visible' }}>
        {/* enclosing "check it" border ring — emphasised when Check it active */}
        <circle cx={cx} cy={cy} r={(ri + ro) / 2} fill="none"
          stroke={GREY60}
          strokeWidth={active === 6 ? 26 : 0}
          strokeDasharray={active === 6 ? '0' : '0'}
          opacity={active === 6 ? 0.18 : 0} />
        {segs.slice().reverse().map((s) => (
          <path key={s.i} d={s.d} fill={s.color} stroke={WHITE} strokeWidth="9"
            strokeLinejoin="round" opacity={s.op}
            style={{ transformOrigin: cx + 'px ' + cy + 'px',
              transform: s.isActive ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 300ms ease' }} />
        ))}
      </svg>
      {/* center label (HTML overlay) */}
      <div style={{ position: 'absolute', left: 70, top: 200, width: 700, height: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', maxWidth: 230 }}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: active >= 0 ? 44 : 40,
            color: BLACK, lineHeight: 1.05, letterSpacing: '0.005em' }}>{centerName}</div>
          <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: 21, color: SUBDUED, marginTop: 8 }}>{centerSub}</div>
        </div>
      </div>

      {/* heading shown during assemble */}
      {!inWalk && (
        <Item start={ASSEMBLE_FROM + 3.4} end={WALK[0][0]} dy={18} style={{ position: 'absolute', left: 880, top: 360, width: 900 }}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 64, color: BLACK, letterSpacing: '0.005em', lineHeight: 1.1 }}>
            Seven stages, in sequence
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: 30, color: SUBDUED, marginTop: 18, lineHeight: 1.45 }}>
            Each one builds on the last. Together they take a pupil from new knowledge to knowledge that sticks.
          </div>
        </Item>
      )}

      {/* the active stage card */}
      {active >= 0 && <StageCard stage={STAGES[active]} active={WALK[active]} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 4 — When the stages happen (94–105)
function Chip({ s, start }) {
  return (
    <Item start={start} end={104.6} dy={22} style={{ display: 'inline-block' }}>
      <div style={{ background: s.color, color: s.ink, fontFamily: FONT, fontWeight: 600,
        fontSize: 30, padding: '16px 26px', borderRadius: 14,
        border: s.color === GREY40 ? '2px solid #222' : 'none',
        boxShadow: '3px 3px 0 ' + LEMON, whiteSpace: 'nowrap' }}>
        {s.key}
      </div>
    </Item>
  );
}
function TimelineScene() {
  const t = useTime();
  return (
    <Sprite start={94} end={105} keepMounted>
      <div style={{ position: 'absolute', inset: 0, padding: '90px 120px' }}>
        <Item start={94.3} end={104.6} dy={20}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 64, color: BLACK, letterSpacing: '0.005em' }}>
            Not all stages happen at once
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: 30, color: SUBDUED, marginTop: 14 }}>
            The framework spans far more than a single lesson.
          </div>
        </Item>

        <div style={{ position: 'absolute', left: 120, right: 120, top: 300, display: 'flex', gap: 30 }}>
          {/* three temporal lanes */}
          <div style={{ flex: '0 0 360px' }}>
            <Item start={95.0} end={104.6}>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 24, color: '#808080', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>Before the lesson</div>
            </Item>
            <Chip s={STAGES[0]} start={95.2} />
          </div>
          <div style={{ flex: 1 }}>
            <Item start={96.2} end={104.6}>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 24, color: '#808080', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>In a lesson</div>
            </Item>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Chip s={STAGES[1]} start={96.4} />
              <Chip s={STAGES[2]} start={96.7} />
              <Chip s={STAGES[3]} start={97.0} />
              <Chip s={STAGES[4]} start={97.3} />
            </div>
          </div>
          <div style={{ flex: '0 0 280px' }}>
            <Item start={98.0} end={104.6}>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 24, color: '#808080', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>Over time</div>
            </Item>
            <Chip s={STAGES[5]} start={98.2} />
          </div>
        </div>

        {/* check it — spanning bracket */}
        <Item start={99.4} end={104.6} dy={16} style={{ position: 'absolute', left: 120, right: 120, top: 520 }}>
          <div style={{ height: 3, background: GREY60, borderRadius: 2 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 22 }}>
            <div style={{ background: GREY60, color: WHITE, fontFamily: FONT, fontWeight: 600, fontSize: 30,
              padding: '16px 26px', borderRadius: 14, boxShadow: '3px 3px 0 ' + LEMON }}>Check it</div>
            <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: 30, color: BLACK }}>
              happens <span style={{ fontWeight: 700 }}>throughout</span> — checking and course-correcting at every stage.
            </div>
          </div>
        </Item>
      </div>
    </Sprite>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 5 — Summary (105–116)
const TAKEAWAYS = [
  'The learning framework guides how we design learning at Oak.',
  'The stages run in sequence — except Check it, which happens throughout.',
  'Not every stage happens within a single lesson.',
  'Miss a stage, or rush it, and learning is likely to suffer.',
];
function SummaryScene() {
  return (
    <Sprite start={105} end={116.4} keepMounted>
      <div style={{ position: 'absolute', inset: 0, padding: '110px 200px' }}>
        <Item start={105.3} end={116} dy={20}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 66, color: BLACK, letterSpacing: '0.005em' }}>
            In summary
          </div>
          <div style={{ width: 240, height: 10, background: LEMON, borderRadius: 100, marginTop: 22 }} />
        </Item>
        <div style={{ marginTop: 56 }}>
          {TAKEAWAYS.map((tk, i) => (
            <Item key={i} start={106.0 + i * 0.9} end={116} dy={22}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22, marginBottom: 30 }}>
                <span style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 100, background: GREEN,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4,
                  boxShadow: '3px 3px 0 ' + LEMON }}>
                  <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8.5l3.2 3.2L13 4.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span style={{ fontFamily: FONT, fontWeight: 300, fontSize: 38, color: BLACK, lineHeight: 1.35, letterSpacing: '-0.005em' }}>{tk}</span>
              </div>
            </Item>
          ))}
        </div>
      </div>
    </Sprite>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCENE 6 — Outro (116–122)
function OutroScene() {
  return (
    <Sprite start={116.4} end={122} keepMounted>
      <Backdrop start={116.6} end={122} color={MINT30} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Item start={116.9} end={122} dy={18}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 70, color: BLACK,
            letterSpacing: '0.005em', lineHeight: 1.1, maxWidth: 1200 }}>
            An evidence-informed model,<br />guiding every Oak lesson.
          </div>
        </Item>
        <Item start={117.6} end={122} dy={14}>
          <img src="assets/logo-full-official.svg" style={{ width: 420, height: 'auto', marginTop: 56 }} />
        </Item>
      </div>
    </Sprite>
  );
}

// ════════════════════════════════════════════════════════════════════════════
function TimecodeLabel() {
  const t = useTime();
  React.useEffect(() => {
    const root = document.getElementById('vid-root');
    if (root) root.setAttribute('data-screen-label', 'Learning framework video @ ' + t.toFixed(0) + 's');
  }, [Math.floor(t)]);
  return null;
}

function LearningFrameworkVideo() {
  return (
    <div id="vid-root" style={{ position: 'absolute', inset: 0 }} data-screen-label="Learning framework video">
      <Stage width={1920} height={1080} duration={122} background={WHITE} persistKey="oak-lf-video">
        <TimecodeLabel />
        <IntroScene />
        <PremiseScene />
        <RingScene />
        <TimelineScene />
        <SummaryScene />
        <OutroScene />
      </Stage>
    </div>
  );
}

window.LearningFrameworkVideo = LearningFrameworkVideo;
