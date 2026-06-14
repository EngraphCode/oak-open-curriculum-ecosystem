frames_raw = [
r"""⠀⠀⠀⠀⣰⠟⠀⠀⠀
⠀⣠⡶⠛⣿⠛⠷⣦⡀
⣼⠋⠀⠀⠹⣧⣀⠘⣷
⢻⣇⠀⠀⠀⠀⠉⢛⡛
⠀⢻⣄⠀⠀⠀⢀⣾⠁
⠀⠀⠙⢷⣤⣴⠟⠁⠀""",
r"""⠀⠀⠀⠀⠀⣠⡿⠂⠀⠀⠀
⠀⠀⢀⣤⣴⣿⣷⣤⣀⠀⠀
⢀⣼⠟⠉⠀⣿⡄⠈⠻⣷⡀
⣾⠇⠀⠀⠀⠘⢿⣄⡀⠘⣷
⠻⣷⠀⠀⠀⠀⠀⠉⠛⢛⠛
⠀⢿⡆⠀⠀⠀⠀⠀⢀⣿⠀
⠀⠈⢿⣆⠀⠀⠀⢀⣾⠏⠀
⠀⠀⠀⠙⠷⣶⣶⠟⠁⠀⠀""",
r"""⠀⠀⠀⠀⠀⠀⢠⣾⠇⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣀⣿⣇⣀⠀⠀⠀⠀
⠀⢀⣴⡾⠟⢻⣿⠛⠛⢿⣦⡀⠀
⢀⣾⠏⠀⠀⠀⢿⣇⠀⠀⠙⣿⡄
⣾⡏⠀⠀⠀⠀⠈⢿⣧⣄⠀⠸⣿
⠿⣷⡄⠀⠀⠀⠀⠀⠈⠛⠿⠿⠿
⠀⢿⣇⠀⠀⠀⠀⠀⠀⠀⢰⣿⠀
⠀⠘⣿⡄⠀⠀⠀⠀⠀⠀⣼⡏⠀
⠀⠀⠈⢿⣦⡀⠀⠀⣠⣾⠟⠀⠀
⠀⠀⠀⠀⠙⠿⣶⣾⠟⠋⠀⠀⠀""",
r"""⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⡿⠂⠀⠀⠀⠀⠀
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
⠀⠀⠀⠀⠀⠈⠛⠿⣿⣿⠿⠋⠁⠀⠀⠀⠀""",
]
BLANK = {'\u2800', ' ', '\u3000', ''}

def to_grid(frame):
    lines = frame.split('\n')
    rows = [[(ch not in BLANK) for ch in line] for line in lines]
    w = max(len(r) for r in rows)
    for r in rows: r += [False]*(w-len(r))
    return rows

def bbox(g):
    ys=[y for y,r in enumerate(g) for x,c in enumerate(r) if c]
    xs=[x for y,r in enumerate(g) for x,c in enumerate(r) if c]
    return min(xs),min(ys),max(xs),max(ys)

def crop(g):
    x0,y0,x1,y1=bbox(g)
    return [row[x0:x1+1] for row in g[y0:y1+1]]

# choose frames to swap (the two largest)
A = crop(to_grid(frames_raw[2]))
B = crop(to_grid(frames_raw[3]))

def place_centered(small, W, H):
    h=len(small); w=len(small[0])
    oy=(H-h)//2; ox=(W-w)//2
    out=[[False]*W for _ in range(H)]
    for y in range(h):
        for x in range(w):
            out[oy+y][ox+x]=small[y][x]
    return out

W=max(len(A[0]),len(B[0])); H=max(len(A),len(B))
A=place_centered(A,W,H); B=place_centered(B,W,H)

# categories per cell: 0 canvas, 1 A-only, 2 B-only, 3 both
cat=[[ (1 if A[y][x] else 0)+(2 if B[y][x] else 0) for x in range(W)] for y in range(H)]

MINT=(184,244,216); INK=(0,0,0)
def sgr(fg=None,bg=None,blink=False):
    parts=[]
    if blink: parts.append('5')
    if fg is not None: parts+=['38','2',str(fg[0]),str(fg[1]),str(fg[2])]
    if bg is not None: parts+=['48','2',str(bg[0]),str(bg[1]),str(bg[2])]
    return '\033['+';'.join(parts)+'m'

# build payload lines
lines=[]
for y in range(H):
    s=''
    for x in range(W):
        c=cat[y][x]
        if c==0:   s+= sgr(bg=MINT)+' '                  # canvas, no blink
        elif c==1: s+= sgr(INK,MINT,blink=True)+'\u2588'  # A-only: ink on-phase, mint off
        elif c==2: s+= sgr(MINT,INK,blink=True)+'\u2588'  # B-only: anti-phase (mint shows, ink hides)
        else:      s+= sgr(INK,INK)+'\u2588'              # both: solid ink, static
    s+='\033[0m'
    lines.append(s)
payload='\n'.join(lines)

# write the standalone bash script with payload baked in
import json
import os
os.makedirs("renders", exist_ok=True)
bash = "#!/usr/bin/env bash\n# Two-frame blink-swap swirl. Foreground blink + fg/bg swap gives anti-phase cells.\n"
bash+= "# Drop into statusLine command, or run directly to eyeball the blink.\n"
bash+= "cat > /dev/null 2>&1   # consume stdin JSON when used as a statusline\n\n"
# encode payload safely via printf %b with octal escapes
enc=payload.replace('\\','\\\\').replace('\033','\\033').replace('%','%%')
bash+="printf '%b\\n' "+ "$'" + payload.replace('\\','\\\\').replace("'", "\\'").replace('\033','\\033').replace('\n','\\n') + "'\n"
with open('renders/swirl_blink.sh','w') as f:
    f.write(bash)
import os; os.chmod('renders/swirl_blink.sh',0o755)

# ---- GIF preview of the two phases ----
from PIL import Image, ImageDraw
CELL=18
def render_phase(on):
    img=Image.new('RGB',(W*CELL,H*CELL),MINT)
    d=ImageDraw.Draw(img)
    for y in range(H):
        for x in range(W):
            c=cat[y][x]
            col=None
            if c==1: col=INK if on else MINT
            elif c==2: col=MINT if on else INK
            elif c==3: col=INK
            if col is not None and col!=MINT:
                d.rectangle([x*CELL,y*CELL,(x+1)*CELL-1,(y+1)*CELL-1],fill=col)
    return img
pa=render_phase(True); pb=render_phase(False)
pa.save('renders/swirl_blink.gif',save_all=True,append_images=[pb],duration=600,loop=0,disposal=2)
# also a side-by-side still
side=Image.new('RGB',(W*CELL*2+20,H*CELL),(255,255,255))
side.paste(pa,(0,0)); side.paste(pb,(W*CELL+20,0))
side.save('renders/phases_side_by_side.png')
print("W,H=",W,H)
print("counts canvas/Aonly/Bonly/both:",
      sum(r.count(0) for r in cat),sum(r.count(1) for r in cat),
      sum(r.count(2) for r in cat),sum(r.count(3) for r in cat))
print("wrote swirl_blink.sh, swirl_blink.gif, phases_side_by_side.png")
