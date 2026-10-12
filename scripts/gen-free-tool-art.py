"""Generates the free-tool illustrations in public/guides/free-tools/.

Run: python3 scripts/gen-free-tool-art.py
Each SVG is a stylized face (or body / swatches) with the feature the tool
measures highlighted in the brand violet.
"""
import os

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "guides", "free-tools")
BG, INK, SKIN, LINE, BRAND, SOFT = "#F6F3FF", "#1E1B2E", "#F3D9C4", "#9C8AA8", "#7C3AED", "#DDD0FB"

def svg(body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">'
            f'<rect width="400" height="300" rx="24" fill="{BG}"/>{body}</svg>')

def face(hl=(), extra=""):
    h = lambda k: BRAND if k in hl else LINE
    w = lambda k: 4 if k in hl else 2.5
    parts = [
        f'<ellipse cx="200" cy="150" rx="88" ry="112" fill="{SKIN}" stroke="{h("outline")}" stroke-width="{w("outline")}"/>',
        f'<path d="M140 108 q22 -14 44 -2 M216 106 q22 -12 44 2" fill="none" stroke="{h("brows")}" stroke-width="{w("brows")+2}" stroke-linecap="round"/>',
        f'<path d="M146 128 q18 -14 36 0 q-18 12 -36 0 Z M218 128 q18 -14 36 0 q-18 12 -36 0 Z" fill="#fff" stroke="{h("eyes")}" stroke-width="{w("eyes")}"/>',
        f'<circle cx="164" cy="128" r="6" fill="{INK}"/><circle cx="236" cy="128" r="6" fill="{INK}"/>',
        f'<path d="M200 135 L192 180 q8 7 16 0 Z" fill="none" stroke="{h("nose")}" stroke-width="{w("nose")}" stroke-linejoin="round"/>',
        f'<path d="M172 208 q14 -12 28 -4 q14 -8 28 4 q-28 22 -56 0 Z" fill="#D98C8C" stroke="{h("lips")}" stroke-width="{w("lips")}"/>',
    ]
    if "forehead" in hl:
        parts.append(f'<path d="M126 92 q74 -70 148 0" fill="none" stroke="{BRAND}" stroke-width="5" stroke-linecap="round"/>')
    if "jaw" in hl:
        parts.append(f'<path d="M118 190 q20 60 82 72 q62 -12 82 -72" fill="none" stroke="{BRAND}" stroke-width="5" stroke-linecap="round"/>')
    if "cheeks" in hl:
        parts.append(f'<ellipse cx="150" cy="178" rx="20" ry="12" fill="#F2A3A3" opacity=".8"/><ellipse cx="250" cy="178" rx="20" ry="12" fill="#F2A3A3" opacity=".8"/>')
    return "".join(parts) + extra

def dots(points):
    return "".join(f'<circle cx="{x}" cy="{y}" r="4" fill="{BRAND}"/>' for x, y in points)

def swatches(colors, y=250):
    n = len(colors); start = 200 - n * 18
    return "".join(f'<rect x="{start + i*36}" y="{y}" width="28" height="28" rx="8" fill="{c}"/>' for i, c in enumerate(colors))

def line(x1, y1, x2, y2, dash=False):
    d = ' stroke-dasharray="6 5"' if dash else ""
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{BRAND}" stroke-width="3"{d}/>'

landmarks = [(146,128),(182,128),(218,128),(254,128),(200,180),(172,208),(228,208),(200,262),(118,190),(282,190),(200,40),(140,108),(260,108)]

art = {
  "face-analyzer": face(("outline","eyes","nose","lips","brows"), dots(landmarks)),
  "face-shape-calculator": face((), line(130,80,270,80)+line(112,150,288,150)+line(126,215,274,215)+line(320,38,320,262)),
  "face-shape-quiz": face(("outline",), '<rect x="300" y="40" width="80" height="34" rx="10" fill="#fff" stroke="#7C3AED" stroke-width="2"/><rect x="300" y="84" width="80" height="34" rx="10" fill="#fff" stroke="#9C8AA8" stroke-width="2"/>'),
  "forehead-shape": face(("forehead",), line(126,82,274,82,True)),
  "jawline-shape": face(("jaw",), dots([(130,222),(270,222),(200,262)])),
  "eye-shape": face(("eyes",), line(140,128,186,128,True)+line(214,128,260,128,True)),
  "eyebrow-shape": face(("brows",), dots([(140,108),(170,98),(184,106),(216,106),(236,98),(260,108)])),
  "nose-shape": face(("nose",), line(186,182,214,182)+line(200,128,200,182,True)),
  "lip-shape": face(("lips",), line(168,218,232,218,True)+line(240,198,240,222)),
  "face-symmetry": face(("eyes","lips"), line(200,30,200,270,True)),
  "eye-distance": face(("eyes",), line(146,150,182,150)+line(182,150,218,150,True)+line(218,150,254,150)),
  "golden-ratio": face(("outline",), line(112,150,288,150)+line(320,38,320,262)+'<text x="330" y="160" font-family="sans-serif" font-size="20" fill="#7C3AED">φ</text>'),
  "canthal-tilt": face(("eyes",), line(140,134,190,124)+line(210,124,260,134)),
  "facial-proportions": face((), line(90,100,310,100,True)+line(90,180,310,180,True)+line(90,262,310,262,True)),
  "attractiveness": face(("outline","eyes","lips"), '<path d="M320 70 a28 28 0 1 1 0.1 0" fill="none" stroke="#7C3AED" stroke-width="6" stroke-dasharray="120 60"/>'),
  "face-rating": face(("outline",), "".join(f'<path d="M{330+i*0} {40+i*30} l5 10 11 1 -8 7 3 11 -11 -6 -11 6 3 -11 -8 -7 11 -1z" fill="#F5B83A"/>' for i in range(5))),
  "skin-tone": face(("cheeks",), dots([(200,70),(150,178),(250,178),(200,245)]) + swatches(["#F6EDE4","#EADABA","#D7BD96","#A07E56","#604134","#292420"], 258)),
  "color-analysis": swatches(["#F7B39A","#F5C02E","#3BA55C","#2AB3B1"], 70)+swatches(["#AFC8E7","#C3B1E1","#C2456E","#6F86A6"], 120)+swatches(["#B5502E","#C9A227","#6B7A3A","#1F7A7A"], 170)+swatches(["#163C8C","#C2186E","#0E8A5F","#141414"], 220),
  "concealer": face(("eyes",), '<ellipse cx="164" cy="150" rx="24" ry="9" fill="#F0A27A" opacity=".7"/><ellipse cx="236" cy="150" rx="24" ry="9" fill="#F0A27A" opacity=".7"/>'),
  "lipstick": face(("lips",), swatches(["#D8957A","#C2262E","#B03A5B","#A86A84","#9E6553"], 258)),
  "blush": face(("cheeks",), swatches(["#F4A988","#E38FA0","#C47A7A","#9C2F59"], 258)),
  "eyeshadow": face(("eyes",), '<path d="M146 126 q18 -22 36 0 M218 126 q18 -22 36 0" fill="none" stroke="#6E3C5E" stroke-width="7" opacity=".6"/>' + swatches(["#B0603A","#6E3C5E","#2E3A6B","#C9A24A"], 258)),
  "blur-face": "".join(f'<circle cx="{x}" cy="130" r="42" fill="{SKIN}"/><g opacity=".85">' + "".join(f'<rect x="{x-36+i*18}" y="{94+j*18}" width="18" height="18" fill="{c}"/>' for i in range(4) for j in range(4) for c in [["#E9CDB7","#D9B79E","#F0D8C6","#C9A68D"][(i+j)%4]]) + '</g><rect x="%d" y="180" width="70" height="80" rx="30" fill="%s"/>' % (x-35, s) for x, s in [(110,"#C3B1E1"),(200,"#AFC8E7"),(290,"#A6DCC0")]),
}

def body(cx, shoulders, waist, hips, color):
    return (f'<circle cx="{cx}" cy="62" r="18" fill="{SKIN}"/>'
            f'<path d="M{cx-shoulders} 92 L{cx+shoulders} 92 L{cx+waist} 170 L{cx+hips} 240 L{cx-hips} 240 L{cx-waist} 170 Z" fill="{color}"/>')

art["body-type"] = body(110,26,16,20,"#AFC8E7") + body(200,40,22,28,"#C3B1E1") + body(290,34,34,40,"#A6DCC0")
art["kibbe-test"] = "".join(body(60+i*70, s, w, h, c) for i,(s,w,h,c) in enumerate([(22,16,20,"#2E3A6B"),(32,24,26,"#6B7A3A"),(26,18,26,"#9C8AA8"),(22,16,22,"#C2456E"),(26,16,32,"#F29CB2")]))
art["kibbe-types"] = art["kibbe-test"]
art["free-tools"] = face(("outline","eyes","lips"), swatches(["#F7B39A","#C3B1E1","#A6DCC0","#F5C02E"], 258))

os.makedirs(OUT, exist_ok=True)
for name, body_svg in art.items():
    with open(os.path.join(OUT, f"{name}.svg"), "w") as f:
        f.write(svg(body_svg))
print(len(art), "illustrations written")
