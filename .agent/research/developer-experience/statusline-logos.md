# Oak Acorn Icon — SVG and Braille Text Renderings

This document records a compact set of Unicode/Braille-style text renderings of the current Oak acorn icon.

The focus is the **new acorn icon only**. The wordmark and the older falling acorn icon are intentionally excluded.

## Aim

The goal is not a pixel-faithful rasterisation. The goal is **human recognition**: a text version that still reads as the Oak acorn when displayed in a terminal, markdown document, code block, README, profile, or similar text-only context.

The best results came from treating the SVG as a recognisable form with a few essential visual cues:

- a narrow, upright acorn body;
- a flowing upper stem or leaf stroke;
- a sharp horizontal shoulder across the upper/middle section;
- curved sides;
- a clear lower nut taper;
- a sharper central bottom point;
- an odd-ish visual width, so the nut can converge towards a central point.

The renderings below use Unicode/Braille/block characters rather than strict ASCII. This gives much better density and curve control at small sizes.

---

## Original SVG

Copyright (c) 2026 Oak National Academy. All rights reserved.

```svg
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 31 42"><path fill="#222" d="M16.983 7.132c.86.15 1.602.243 2.328.41a14.603 14.603 0 0 1 8.09 4.962 14.964 14.964 0 0 1 3.513 8.535c.05.58.082 1.16.092 1.74.012.627-.086.738-.676.824-2.213.32-4.468.142-6.604-.521a14.775 14.775 0 0 1-3.871-1.838 13.412 13.412 0 0 1-3.74-3.803 13.242 13.242 0 0 1-2.07-5.484c-.107-.711-.124-1.434-.191-2.234a12.84 12.84 0 0 0-6.444 3.065c-2.65 2.319-4.192 5.265-4.748 8.808.536.108 1.029.224 1.532.303.447.07.71.243.724.76.046 1.658.345 3.3.887 4.865a31.677 31.677 0 0 0 1.983 4.418 16.044 16.044 0 0 0 4.608 5.383 17.559 17.559 0 0 0 3.214 1.861c.383.17 1.015-.104 1.483-.301a13.611 13.611 0 0 0 5.595-4.23c.835-1.077 1.497-2.307 2.12-3.529.755-1.482 1.063-3.115 1.258-4.761.039-.323.15-.454.481-.423.396.04.794.05 1.191.034.474-.025.675.223.613.638-.191 1.314-.306 2.66-.67 3.927a16.896 16.896 0 0 1-4.344 7.268 15.366 15.366 0 0 1-6.6 4.002c-.504.15-.926-.028-1.372-.176-2.78-.924-5.066-2.6-6.995-4.773a28.75 28.75 0 0 1-2.51-3.27 20.02 20.02 0 0 1-2.158-4.435 18.563 18.563 0 0 1-1.074-5.01.49.49 0 0 0-.303-.325c-.592-.194-1.197-.327-1.795-.493a.613.613 0 0 1-.516-.484.628.628 0 0 1-.003-.25c.154-2.56.889-5.05 2.147-7.278a16.25 16.25 0 0 1 4.174-4.84 15.682 15.682 0 0 1 6.32-2.969 1.19 1.19 0 0 1 .326-.071c1.117.102 1.404-.63 1.682-1.53a11.998 11.998 0 0 1 3.683-5.58c.5-.436.564-.436 1.01 0 .26.26.511.53.755.804.361.41.361.594-.048.967-.947.895-1.73 1.95-2.316 3.119-.286.624-.54 1.264-.76 1.915ZM28.538 21.4c-.032-.174-.065-.312-.084-.45a13.55 13.55 0 0 0-2.01-5.466 12.892 12.892 0 0 0-5.012-4.62A12.335 12.335 0 0 0 17 9.605c-.272-.03-.42.046-.414.36.056 2.427.701 4.674 2.12 6.64a11.662 11.662 0 0 0 5.268 4.082c1.465.58 2.978.754 4.564.713Z"/></svg>
```

---

## Text rendering principles

These versions are optimised by hand for recognition rather than mathematical conversion.

Important design choices:

1. **Preserve the vertical feel**  
   The original SVG is taller than it is wide. The text versions should avoid becoming squat or blob-like.

2. **Keep the shoulder sharp**  
   The horizontal-ish line through the upper/middle part is one of the things that makes the icon interesting. It provides a counterpoint to the flowing curves.

3. **Sharpen the bottom nut tip**  
   Earlier versions were too soft at the bottom. The improved versions give the acorn a clearer central convergence.

4. **Prefer odd visual widths**  
   Odd-width layouts allow a stronger central point at the bottom of the nut.

5. **Use Braille/block density where useful**  
   Characters such as `⣾`, `⣿`, `⣷`, `⠿`, `⠛`, `⠟`, and related forms give good curve and weight at small sizes.

---

# Braille / Unicode renderings

## 6-line version

Best for very constrained contexts, status text, compact signatures, or small decorative use.

```text
⠀⠀⠀⠀⣰⠟⠀⠀⠀
⠀⣠⡶⠛⣿⠛⠷⣦⡀
⣼⠋⠀⠀⠹⣧⣀⠘⣷
⢻⣇⠀⠀⠀⠀⠉⢛⡛
⠀⢻⣄⠀⠀⠀⢀⣾⠁
⠀⠀⠙⢷⣤⣴⠟⠁⠀
```

## 8-line version

A good balance between compactness and recognisability.

```text
⠀⠀⠀⠀⠀⣠⡿⠂⠀⠀⠀
⠀⠀⢀⣤⣴⣿⣷⣤⣀⠀⠀
⢀⣼⠟⠉⠀⣿⡄⠈⠻⣷⡀
⣾⠇⠀⠀⠀⠘⢿⣄⡀⠘⣷
⠻⣷⠀⠀⠀⠀⠀⠉⠛⢛⠛
⠀⢿⡆⠀⠀⠀⠀⠀⢀⣿⠀
⠀⠈⢿⣆⠀⠀⠀⢀⣾⠏⠀
⠀⠀⠀⠙⠷⣶⣶⠟⠁⠀⠀
```

## 10-line version

A stronger version for README use, documentation, CLI splash screens, or places where the icon can afford a little more height.

```text
⠀⠀⠀⠀⠀⠀⢠⣾⠇⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣀⣿⣇⣀⠀⠀⠀⠀
⠀⢀⣴⡾⠟⢻⣿⠛⠛⢿⣦⡀⠀
⢀⣾⠏⠀⠀⠀⢿⣇⠀⠀⠙⣿⡄
⣾⡏⠀⠀⠀⠀⠈⢿⣧⣄⠀⠸⣿
⠿⣷⡄⠀⠀⠀⠀⠀⠈⠛⠿⠿⠿
⠀⢿⣇⠀⠀⠀⠀⠀⠀⠀⢰⣿⠀
⠀⠘⣿⡄⠀⠀⠀⠀⠀⠀⣼⡏⠀
⠀⠀⠈⢿⣦⡀⠀⠀⣠⣾⠟⠀⠀
⠀⠀⠀⠀⠙⠿⣶⣾⠟⠋⠀⠀⠀
```

## 12-line version

Best overall version. This preserves the aspect ratio, the horizontal shoulder, the curved body, and the sharper nut tip most successfully.

```text
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⡿⠂⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣾⡿⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢀⣤⣶⣾⣿⣿⡿⣿⣶⣦⣀⠀⠀⠀
⠀⢀⣴⣿⠟⠉⠀⢸⣿⡇⠀⠈⠙⢿⣷⡄⠀
⢀⣾⡟⠁⠀⠀⠀⠀⢻⣿⡄⠀⠀⠀⠹⣿⡄
⣾⡿⠀⠀⠀⠀⠀⠀⠀⠻⣿⣦⣄⡀⠀⢻⣿
⠿⣿⣶⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⠿⠿⡿⠿
⠀⢸⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⡆⠀
⠀⠈⢿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⡇⠀
⠀⠀⠈⢿⣧⡀⠀⠀⠀⠀⠀⠀⢠⣿⡟⠀⠀
⠀⠀⠀⠀⠻⣿⣦⡀⠀⠀⣀⣴⣿⠏⠀⠀⠀
⠀⠀⠀⠀⠀⠈⠛⠿⣿⣿⠿⠋⠁⠀⠀⠀⠀
```

---

# Black glyphs on green background

Markdown itself does not reliably support foreground/background colour in code fences. There are two practical approaches:

1. use HTML `<pre>` where supported;
2. use ANSI escape codes in a terminal.

## HTML version

This works in contexts that allow inline HTML and CSS, such as many markdown renderers.

```html
<pre style="background:#B8F4D8;color:#000;padding:12px 16px;display:inline-block;line-height:1.05;font-family:monospace;font-size:18px;border-radius:8px;">
 ⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⡿⠂⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣾⡿⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢀⣤⣶⣾⣿⣿⡿⣿⣶⣦⣀⠀⠀⠀
⠀⢀⣴⣿⠟⠉⠀⢸⣿⡇⠀⠈⠙⢿⣷⡄⠀
⢀⣾⡟⠁⠀⠀⠀⠀⢻⣿⡄⠀⠀⠀⠹⣿⡄
⣾⡿⠀⠀⠀⠀⠀⠀⠀⠻⣿⣦⣄⡀⠀⢻⣿
⠿⣿⣶⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⠿⠿⡿⠿
⠀⢸⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⡆⠀
⠀⠈⢿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⡇⠀
⠀⠀⠈⢿⣧⡀⠀⠀⠀⠀⠀⠀⢠⣿⡟⠀⠀
⠀⠀⠀⠀⠻⣿⣦⡀⠀⠀⣀⣴⣿⠏⠀⠀⠀
⠀⠀⠀⠀⠀⠈⠛⠿⣿⣿⠿⠋⠁⠀⠀⠀⠀</pre>
```

## Bash / terminal colour version

This prints black glyphs on a mint-green background in terminals that support ANSI true colour.

```bash
#!/usr/bin/env bash

# Black foreground, mint-green background.
START=$'\033[38;2;0;0;0;48;2;184;244;216m'
RESET=$'\033[0m'

render() {
  printf '%s\n' "$START"
  cat
  printf '%s\n\n' "$RESET"
}

render <<'EOF'
⠀⠀⠀⠀⣰⠟⠀⠀⠀
⠀⣠⡶⠛⣿⠛⠷⣦⡀
⣼⠋⠀⠀⠹⣧⣀⠘⣷
⢻⣇⠀⠀⠀⠀⠉⢛⡛
⠀⢻⣄⠀⠀⠀⢀⣾⠁
⠀⠀⠙⢷⣤⣴⠟⠁⠀
EOF

render <<'EOF'
⠀⠀⠀⠀⠀⣠⡿⠂⠀⠀⠀
⠀⠀⢀⣤⣴⣿⣷⣤⣀⠀⠀
⢀⣼⠟⠉⠀⣿⡄⠈⠻⣷⡀
⣾⠇⠀⠀⠀⠘⢿⣄⡀⠘⣷
⠻⣷⠀⠀⠀⠀⠀⠉⠛⢛⠛
⠀⢿⡆⠀⠀⠀⠀⠀⢀⣿⠀
⠀⠈⢿⣆⠀⠀⠀⢀⣾⠏⠀
⠀⠀⠀⠙⠷⣶⣶⠟⠁⠀⠀
EOF

render <<'EOF'
⠀⠀⠀⠀⠀⠀⢠⣾⠇⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣀⣿⣇⣀⠀⠀⠀⠀
⠀⢀⣴⡾⠟⢻⣿⠛⠛⢿⣦⡀⠀
⢀⣾⠏⠀⠀⠀⢿⣇⠀⠀⠙⣿⡄
⣾⡏⠀⠀⠀⠀⠈⢿⣧⣄⠀⠸⣿
⠿⣷⡄⠀⠀⠀⠀⠀⠈⠛⠿⠿⠿
⠀⢿⣇⠀⠀⠀⠀⠀⠀⠀⢰⣿⠀
⠀⠘⣿⡄⠀⠀⠀⠀⠀⠀⣼⡏⠀
⠀⠀⠈⢿⣦⡀⠀⠀⣠⣾⠟⠀⠀
⠀⠀⠀⠀⠙⠿⣶⣾⠟⠋⠀⠀⠀
EOF

render <<'EOF'
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⡿⠂⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣾⡿⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢀⣤⣶⣾⣿⣿⡿⣿⣶⣦⣀⠀⠀⠀
⠀⢀⣴⣿⠟⠉⠀⢸⣿⡇⠀⠈⠙⢿⣷⡄⠀
⢀⣾⡟⠁⠀⠀⠀⠀⢻⣿⡄⠀⠀⠀⠹⣿⡄
⣾⡿⠀⠀⠀⠀⠀⠀⠀⠻⣿⣦⣄⡀⠀⢻⣿
⠿⣿⣶⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⠿⠿⡿⠿
⠀⢸⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⡆⠀
⠀⠈⢿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⡇⠀
⠀⠀⠈⢿⣧⡀⠀⠀⠀⠀⠀⠀⢠⣿⡟⠀⠀
⠀⠀⠀⠀⠻⣿⣦⡀⠀⠀⣀⣴⣿⠏⠀⠀⠀
⠀⠀⠀⠀⠀⠈⠛⠿⣿⣿⠿⠋⠁⠀⠀⠀⠀
EOF
```

For a simpler but less brand-faithful terminal green, replace the `START` line with:

```bash
START=$'\033[30;42m'
```

That uses standard ANSI black-on-green rather than true-colour mint.

---

# Recommended usage

## Best compact version

Use the 8-line version when space is tight but the icon still needs to be recognisable.

```text
⠀⠀⠀⠀⠀⣠⡿⠂⠀⠀⠀
⠀⠀⢀⣤⣴⣿⣷⣤⣀⠀⠀
⢀⣼⠟⠉⠀⣿⡄⠈⠻⣷⡀
⣾⠇⠀⠀⠀⠘⢿⣄⡀⠘⣷
⠻⣷⠀⠀⠀⠀⠀⠉⠛⢛⠛
⠀⢿⡆⠀⠀⠀⠀⠀⢀⣿⠀
⠀⠈⢿⣆⠀⠀⠀⢀⣾⠏⠀
⠀⠀⠀⠙⠷⣶⣶⠟⠁⠀⠀
```

## Best overall version

Use the 12-line version where quality matters more than compactness.

```text
⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⡿⠂⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⣾⡿⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢀⣤⣶⣾⣿⣿⡿⣿⣶⣦⣀⠀⠀⠀
⠀⢀⣴⣿⠟⠉⠀⢸⣿⡇⠀⠈⠙⢿⣷⡄⠀
⢀⣾⡟⠁⠀⠀⠀⠀⢻⣿⡄⠀⠀⠀⠹⣿⡄
⣾⡿⠀⠀⠀⠀⠀⠀⠀⠻⣿⣦⣄⡀⠀⢻⣿
⠿⣿⣶⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⠿⠿⡿⠿
⠀⢸⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⡆⠀
⠀⠈⢿⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⡇⠀
⠀⠀⠈⢿⣧⡀⠀⠀⠀⠀⠀⠀⢠⣿⡟⠀⠀
⠀⠀⠀⠀⠻⣿⣦⡀⠀⠀⣀⣴⣿⠏⠀⠀⠀
⠀⠀⠀⠀⠀⠈⠛⠿⣿⣿⠿⠋⠁⠀⠀⠀⠀
```

---

# Notes

These text renderings are deliberately interpretive. They are not intended to replace the SVG in formal brand contexts. They are useful where the medium itself is text: markdown, terminals, source comments, docs, small status displays, or playful developer-facing material.

For faithful visual display, use the SVG. For recognisable text display, use the 8-line or 12-line Braille/Unicode rendering.
