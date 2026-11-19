#!/usr/bin/env python3
"""Render the SVG charts for the heating post from assets/posts/heating-with-ai/data.json.

    python3 scripts/heating-charts.py

Refresh data.json first with the export script in the Home Assistant repo (needs the LAN):
    ~/dev/hass/scripts/heating-post-export.py --out assets/posts/heating-with-ai/data.json
Numbers quoted in the post's text are written by hand; update them after a refresh.

The SVGs carry no colours of their own: classes map to the site's theme variables
(`.chart` rules in assets/css/main.css), so they follow light and dark mode. The post inlines
them with the `chart` shortcode.
"""
import json
import re
from datetime import datetime, timedelta
from html import unescape
from pathlib import Path
from xml.sax.saxutils import escape

DIR = Path(__file__).resolve().parent.parent / "assets" / "posts" / "heating-with-ai"
DATA = json.loads((DIR / "data.json").read_text())
W = 680


# Rendered text sizes (px) at the widest layout and its viewBox scale (assets/css/main.css, --k), used to
# estimate how far text reaches so each chart's contents can be centred in its frame.
FONT_PX = {"d-title": 16, "label": 14.5, "d-note": 14, "value": 13.5, "tick": 12.5, "note": 12.5}
K_WIDE = 0.739


def x_extent(body):
    """Leftmost and rightmost x reached by the drawing, with text widths estimated from their size."""
    xs = []
    for el in body:
        if el.startswith("<defs"):
            continue
        for m in re.finditer(r'<text x="([-\d.]+)" y="[-\d.]+" text-anchor="(\w+)"(?: class="([^"]*)")?[^>]*>([^<]*)</text>', el):
            x, anchor, cls, s = float(m[1]), m[2], (m[3] or "").split(), unescape(m[4])
            w = len(s) * K_WIDE * next((FONT_PX[c] for c in cls if c in FONT_PX), 14) * 0.5
            xs += {"end": [x - w, x], "middle": [x - w / 2, x + w / 2]}.get(anchor, [x, x + w])
        for m in re.finditer(r'<rect x="([-\d.]+)" y="[-\d.]+" width="([\d.]+)"', el):
            xs += [float(m[1]), float(m[1]) + float(m[2])]
        for m in re.finditer(r'\b(?:x1|x2|cx)="([-\d.]+)"', el):
            xs.append(float(m[1]))
        for m in re.finditer(r' d="([^"]+)"', el):
            xs += [float(a) for a in re.findall(r"[ML]([-\d.]+),", m[1])]
    return min(xs), max(xs)


def svg(name, height, title, desc, body):
    lo, hi = x_extent(body)
    x0 = (lo + hi) / 2 - W / 2  # shift the viewBox so the drawing sits in the middle of the frame
    out = (
        f'<svg viewBox="{x0:.1f} 0 {W} {height}" role="img" aria-labelledby="{name}-t {name}-d" '
        f'xmlns="http://www.w3.org/2000/svg">\n'
        f'<title id="{name}-t">{escape(title)}</title>\n<desc id="{name}-d">{escape(desc)}</desc>\n'
        + "\n".join(body) + "\n</svg>\n"
    )
    (DIR / f"{name}.svg").write_text(out)


def scale(d0, d1, r0, r1):
    return lambda v: r0 + (v - d0) * (r1 - r0) / (d1 - d0)


def text(x, y, s, cls="", anchor="start", extra=""):
    c = f' class="{cls}"' if cls else ""
    return f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}"{c}{extra}>{escape(s)}</text>'


def line(x1, y1, x2, y2, cls):
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" class="{cls}"/>'


def rect(x, y, w, h, cls, rx=0):
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{max(w, 0):.1f}" height="{max(h, 0):.1f}" rx="{rx}" class="{cls}"/>'


def path(points, cls):
    d = " ".join(f"{'M' if i == 0 else 'L'}{x:.1f},{y:.1f}" for i, (x, y) in enumerate(points))
    return f'<path d="{d}" class="{cls}"/>'


def y_axis(body, ys, ticks, left, right, fmt):
    for v in ticks:
        body.append(line(left, ys(v), right, ys(v), "grid"))
        body.append(text(left - 8, ys(v) + 4, fmt(v), "tick", "end"))


def legend(body, x, y, items):
    for cls, label in items:
        body.append(rect(x, y - 9, 12, 12, f"{cls} solid", 2))
        body.append(text(x + 18, y + 1, label, "label"))
        x += 30 + 7.9 * len(label)


# 1. Condensing share per day ---------------------------------------------------------------
def daily():
    days = DATA["daily"]
    h, top, bottom, left, right = 300, 46, 250, 44, W - 10
    ys = scale(0, 100, bottom, top)
    body = []
    legend(body, left, 18, [("s-before", "69 °C"), ("s-change", "change day"), ("s-after", "60 °C, −6 K"), ("s-after2", "60 °C, −10 K")])
    y_axis(body, ys, [0, 25, 50, 75, 100], left, right, lambda v: f"{v}%")
    body.append(line(left, ys(90), right, ys(90), "target"))
    body.append(text(left + 4, ys(90) - 6, "the agent's target: over 90 %", "note"))
    slot = (right - left) / len(days)
    for i, d in enumerate(days):
        day = datetime.strptime(d["day"], "%Y-%m-%d")
        cls = "s-before" if day.day < 13 else "s-change" if day.day in (13, 16) else "s-after" if day.day < 16 else "s-after2"
        v = d["condensing_pct"]
        x = left + i * slot + slot * 0.22
        bw = slot * 0.56
        body.append(rect(x, ys(v), bw, bottom - ys(v), f"{cls} solid", 3))
        body.append(text(x + bw / 2, ys(v) - 7, f"{v}%", "value", "middle"))
        body.append(text(x + bw / 2, bottom + 18, day.strftime("%a %-d"), "tick", "middle"))
    svg("daily", h, "Share of heating time spent condensing, per day",
        "Bars per day from 10 to 18 November. 25 to 31 percent while the flow was 69 °C, 53 percent on the change day, "
        "93 to 97 percent at 60 °C, and 96 and 76 percent after the restart band was widened on 16 November.", body)


# 2. Return temperature over three hours of a night, before and after ----------------------------
def trace():
    # Burner runs are full-height bands and the return line is coloured the same way: green while
    # firing with the return below 55 °C (condensing), orange while firing above it, grey (no band)
    # with the burner off, when the return temperature doesn't matter.
    h, panel, gap, left, right = 548, 160, 100, 44, W - 10
    body = []
    legend(body, left, 18, [("s-good", "burner on, condensing"), ("s-bad", "burner on, not condensing"),
                            ("s-off", "burner off")])
    heads = {"before": ("Before", "69 °C flow"), "after": ("After the first change", "60 °C flow")}
    for p, key in enumerate(["before", "after"]):
        t = DATA["trace"][key]
        top = 100 + p * (panel + gap)
        bottom = top + panel
        xs = scale(0, 180, left, right)
        ys = scale(35, 75, bottom, top)
        pts = t["points"]
        state = lambda rt, firing: None if not firing or rt is None else ("band-good" if rt < 55 else "band-bad")
        starts, bands, run = 0, [], None
        for i, (m, fl, rt, firing) in enumerate(pts):
            if firing and (i == 0 or not pts[i - 1][3]):
                starts += 1
            s = state(rt, firing)
            if run and (s != run[1] or i == len(pts) - 1):
                bands.append(rect(xs(run[0]), top, max(xs(m) - xs(run[0]), 1.5), panel, run[1]))
                run = None
            if s and not run:
                run = (m, s)
        body.extend(bands)
        y_axis(body, ys, [40, 50, 60, 70], left, right, lambda v: f"{v}°")
        body.append(line(left, ys(55), right, ys(55), "target"))
        body.append(text(left - 8, ys(55) + 4, "55°", "tick strong good-text", "end"))
        line_cls = {"band-good": "s-good", "band-bad": "s-bad", None: "s-off"}
        seg, cur = [], None
        for m, fl, rt, firing in pts:
            if rt is None:
                continue
            pt, s = (xs(m), ys(min(max(rt, 35), 75))), line_cls[state(rt, firing)]
            if s != cur and seg:
                seg.append(pt)
                body.append(path(seg, f"series trace-line {cur}"))
                seg = []
            seg.append(pt)
            cur = s
        if len(seg) > 1:
            body.append(path(seg, f"series trace-line {cur}"))
        firing_rt = [rt for _, _, rt, firing in pts if firing and rt is not None]
        share = round(100 * sum(rt < 55 for rt in firing_rt) / len(firing_rt))
        for m in (0, 60, 120, 180):
            body.append(text(xs(m), bottom + 16, ["00:00", "01:00", "02:00", "03:00"][m // 60], "tick", "middle"))
        title, setting = heads[key]
        night = t["label"].split(", ", 1)[1]
        body.append(text(left, top - 36, f"{title}: {setting}", "label strong"))
        body.append(text(right, top - 36, f"{starts} starts · {share} % condensing",
                         f"label strong {'good-text' if share >= 50 else 'bad-text'}", "end"))
        body.append(text(left, top - 18, f"{night}, midnight to 3 am, {t['outdoor']:.0f} °C outside", "note"))
    svg("trace", h, "Return water temperature between midnight and 3 am, before and after lowering the flow to 60 °C",
        "Two panels. Before, at 69 °C, the return stays above 55 °C whenever the burner fires, so it almost never condenses. "
        "After, at 60 °C, most of the firing time is below 55 °C and condensing, but the burner still starts every few minutes.", body)


# 4. Burner cycle lengths -----------------------------------------------------------------
def cycles():
    h, top, bottom, left, right = 290, 46, 240, 44, W - 10
    cy = DATA["cycles"]
    labels = [b[0] for b in cy["before"]["bins"]]
    pct = {k: [100 * n / cy[k]["n"] for _, n in cy[k]["bins"]] for k in cy}
    ys = scale(0, 40, bottom, top)
    body = []
    keys = ("before", "after", "after2")
    legend(body, left, 18, [("s-before", f"69 °C ({cy['before']['n']} runs)"), ("s-after", f"60 °C, −6 K ({cy['after']['n']})"),
                            ("s-after2", f"60 °C, −10 K ({cy['after2']['n']})")])
    y_axis(body, ys, [0, 10, 20, 30, 40], left, right, lambda v: f"{v}%")
    slot = (right - left) / len(labels)
    for i, lab in enumerate(labels):
        x0 = left + i * slot + slot * 0.11
        bw = slot * 0.26
        for j, key in enumerate(keys):
            v = pct[key][i]
            body.append(rect(x0 + j * bw, ys(v), bw - 3, bottom - ys(v), f"s-{key} solid", 2))
        body.append(text(left + (i + 0.5) * slot, bottom + 18, lab, "tick", "middle"))
    body.append(text(left + (right - left) / 2, bottom + 40, "minutes per burner run", "note", "middle"))
    x5 = left + 4 * slot
    body.append(line(x5, top - 4, x5, bottom, "target"))
    body.append(text(x5 - 8, top + 10, "under 5 min: " + " → ".join(f"{cy[k]['under5_pct']} %" for k in keys), "label strong", "end"))
    x8 = left + 5 * slot
    body.append(line(x8, top - 4, x8, bottom, "target"))
    body.append(text(x8 + 8, top + 10, "healthy: 8 min and up →", "note good-text"))
    svg("cycles", h, "How long each burner run lasted at each setting",
        "Grouped bars of run length. Lowering the flow to 60 °C left the distribution almost unchanged, about three "
        "quarters of runs under five minutes; widening the restart band to −10 K moved runs from under three minutes "
        "to three to five minutes and longer. Runs of eight minutes or more, the healthy length, stay a minority.", body)


# 5. Living room warming up with the valve fully open ------------------------------------------
def heatup():
    h, top, bottom, left, right = 300, 40, 250, 44, W - 10
    hu = DATA["heatup"]
    xs = scale(0, 130, left, right)
    ys = scale(0, 1.6, bottom, top)
    body = []
    y_axis(body, ys, [0, 0.4, 0.8, 1.2, 1.6], left, right, lambda v: f"+{v:.1f}°")
    for m in range(0, 131, 30):
        body.append(text(xs(m), bottom + 18, f"{m} min", "tick", "middle"))
    for row, (key, cls) in enumerate((("before", "s-before"), ("after", "s-after"), ("after2", "s-after dashed"))):
        r = hu[key]
        t0 = r["points"][0][1]
        pts = [(xs(m), ys(t - t0)) for m, t in r["points"]]
        body.append(path(pts, f"series {cls}"))
        m_end, t_end = r["points"][-1]
        rate = (t_end - t0) / (m_end / 60)
        body.append(f'<circle cx="{xs(m_end):.1f}" cy="{ys(t_end - t0):.1f}" r="3.5" class="{cls.split()[0]} solid"/>')
        ly = ys(1.48 - 0.14 * row) + 4
        lx = xs(3)
        body.append(path([(lx, ly - 4), (lx + 24, ly - 4)], f"series {cls}"))
        body.append(text(lx + 32, ly, f"{r['label']}: {rate:.2f} °C/h", f"label strong {cls.split()[0]}-text"))
        body.append(text(right, ly, f"{r['mean_flow']:.0f} °C flow, {r['outdoor']:.0f} °C out", "note", "end"))
    svg("heatup", h, "Living room warming up in the morning with its valve fully open",
        "Temperature rise since the valve opened fully. At 69 °C the room rose 1.3 °C in 75 minutes; at 60 °C it rose "
        "0.9 °C in 80 minutes and 0.9 °C in 125 minutes, on milder mornings.", body)


# 6. Gas cost per degree of warmth, per day, against the old settings on the same day ---------------
def gas_cost():
    h, top, bottom, left, right = 348, 50, 262, 48, W - 10
    gm = DATA["gas_model"]
    rate = gm["rate_p_per_kwh"]
    days = gm["nov2026"]
    ys = scale(0, 60, bottom, top)
    series_of = {"69 °C": "s-before", "change day": "s-change", "60 °C": "s-after", "60 °C, −10 K": "s-after2"}
    body = []
    legend(body, left, 18, [("s-before", "69 °C"), ("s-after", "60 °C, −6 K"), ("s-after2", "60 °C, −10 K")])
    body.append(line(left + 400, 12, left + 424, 12, "marker"))
    body.append(text(left + 432, 17, "old settings, same day", "label"))
    for v in range(0, 61, 20):
        body.append(line(left, ys(v), right, ys(v), "grid"))
        body.append(text(left - 8, ys(v) + 4, f"{v}p", "tick", "end"))
    slot = (right - left) / len(days)
    for i, d in enumerate(days):
        clean = (d["relay_off_h"] or 0) < 1
        v, e = d["actual"] * rate / d["dT"], d["expected"] * rate / d["dT"]
        x, bw = left + i * slot + slot * 0.2, slot * 0.6
        cls = series_of[d["setting"]]
        bar = rect(x, ys(v), bw, bottom - ys(v), f"{cls} solid", 3)
        body.append(bar if clean else bar.replace('class="', 'fill-opacity="0.25" class="'))
        if clean:
            body.append(line(x - 5, ys(e), x + bw + 5, ys(e), "marker"))
            body.append(text(x + bw / 2, min(ys(v), ys(e)) - 8, f"{v:.0f}p", "value", "middle"))
        else:
            body.append(text(x + bw / 2, ys(v) - 8, "gap", "note", "middle"))
        day = datetime.strptime(d["date"], "%Y-%m-%d")
        body.append(text(x + bw / 2, bottom + 18, day.strftime("%a %-d"), "tick", "middle"))
    # Usual range at the old settings: the middle 80 % of the baseline days' cost per degree.
    base = sorted(g * rate / dt for g, dt in gm["baseline_gas_dT"])
    p10, p90 = base[round(0.1 * (len(base) - 1))], base[round(0.9 * (len(base) - 1))]
    body.insert(0, rect(left, ys(p90), right - left, ys(p10) - ys(p90), "zone"))
    body.append(text(left, bottom + 44, f"Shaded: the usual range in November 2024 at the old settings, {p10:.0f}p to {p90:.0f}p.", "note"))
    body.append(text(left, bottom + 62, "Faded: heating controls offline for part of the day, so not comparable.", "note"))
    svg("gas-cost", h, "Gas cost per degree of warmth, per day",
        "Bars per day from 10 to 18 November: what the day's gas cost, divided by how many degrees warmer the house was "
        "than outside. A marker on each complete day shows what the old settings would have cost on the same day. "
        "10 and 11 November sit 4 % and 11 % above their markers; 17 November, the only complete day at the new "
        "settings, is 8 % above its marker.", body)


# 7. How expected gas is worked out (diagram) --------------------------------------------------
def model_diagram():
    h = 470
    c = [round(x, 1) for x in DATA["gas_model"]["coef"]]
    rm = DATA["gas_model"]["loo_rmse_kwh"]
    sign = lambda v: f"{'+' if v >= 0 else '−'}{abs(v):.1f}"
    body = ['<defs><marker id="model-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
            'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="arrowhead"/></marker></defs>']

    def box(x, y, w, hh, title, lines, cls="box"):
        body.append(rect(x, y, w, hh, cls, 10))
        body.append(text(x + 14, y + 25, title, "d-title"))
        for i, s in enumerate(lines):
            body.append(text(x + 14, y + 46 + 18 * i, s, "d-note"))

    def arrow(d):
        body.append(f'<path d="{d}" class="arrow" marker-end="url(#model-arrow)"/>')

    inputs = [("Indoor − outdoor", "6 rooms vs outside"), ("Sunshine", "weather archive"),
              ("Wind", "weather archive"), ("Weekend", "more people home")]
    for i, (t, n) in enumerate(inputs):
        y = 10 + i * 76
        box(0, y, 180, 62, t, [n])
        arrow(f"M182,{y + 31} L224,{160 + (i - 1.5) * 18:.0f}")
    box(228, 40, 222, 214, "Old-settings model", [f"{sign(c[1])} per °C indoor − outdoor",
        f"{sign(c[2])} per kWh/m² of sun", f"{sign(c[3])} per km/h of wind", f"{sign(c[4])} at weekends",
        f"{sign(c[0])} to start from", "kWh per day, fitted on", "40 days at 69 °C"], "box box-accent")
    body.append(text(242, 238, f"typical error ±{rm:.0f} kWh/day", "d-note warn"))
    box(492, 10, 188, 62, "Expected gas", ["at the old settings"], "box box-accent")
    arrow("M452,110 L490,60")
    box(492, 120, 188, 62, "Difference", ["expected − measured"])
    box(492, 230, 188, 62, "Measured gas", ["smart meter"])
    arrow("M586,74 L586,118")
    arrow("M586,228 L586,184")
    arrow("M492,151 L470,151 L470,336")
    box(360, 340, 320, 120, "Running total", ["adds up the daily differences", "on the Boiler tab, skipping", "days with gaps in the data"], "box box-accent")
    box(0, 340, 330, 120, "Left out: heating hours", ["at 60 °C the valves stay open longer", "for the same heat, so they would", "fake a saving"], "box box-muted")
    svg("model", h, "How expected gas is worked out",
        "Four inputs (indoor minus outdoor temperature, sunshine, wind, weekend) feed a model fitted at the old boiler "
        "settings. Its expected gas is compared with the smart meter each day, and the differences are added up. "
        "Heating hours are left out because they change with the flow temperature.", body)


# 8. Room temperature with the heating spells, for the rooms we heat --------------------------------
def rooms():
    rm = DATA["rooms"]
    names = {"living_room": "Living room", "office": "Office", "bedroom": "Bedroom"}
    left, right, top, row, gap = 92, W - 10, 40, 96, 18
    span = rm["days"] * 1440
    xs = scale(0, span, left, right)
    temps = [v for k in names for v in rm["temps"][k] if v is not None]
    lo, hi = int(min(temps)), int(max(temps)) + 1
    h = top + len(names) * (row + gap) + 26
    body = []
    body.append(path([(left, 12), (left + 24, 12)], "series s-bad"))
    body.append(text(left + 32, 17, "heating (radiator valve open)", "label"))
    body.append(path([(left + 270, 12), (left + 294, 12)], "series s-off"))
    body.append(text(left + 302, 17, "not heating", "label"))
    start = datetime.strptime(rm["start"], "%Y-%m-%d")
    for i, (key, label) in enumerate(names.items()):
        y0 = top + i * (row + gap)
        ys = scale(lo, hi, y0 + row, y0)
        step = rm["step_min"]
        spells = rm["heating"][key]
        heating = lambda m: any(a < m + step and b > m for a, b in spells)
        for a, b in spells:
            body.append(rect(xs(a), y0, xs(b) - xs(a), row, "s-bad solid", 0).replace('class="', 'fill-opacity="0.16" class="'))
        for v in range(lo, hi + 1, 2):
            body.append(line(left, ys(v), right, ys(v), "grid"))
            body.append(text(left - 8, ys(v) + 4, f"{v}°", "tick", "end"))
        for d in range(1, rm["days"]):
            body.append(line(xs(d * 1440), y0, xs(d * 1440), y0 + row, "grid"))
        # Runs of consecutive points with the same state; each run repeats the previous point so the line is unbroken.
        runs, prev = [], None
        for j, v in enumerate(rm["temps"][key]):
            if v is None:
                prev = None
                continue
            pt, on = (xs(j * step + step / 2), ys(v)), heating(j * step)
            if prev is None or on != runs[-1][0]:
                runs.append((on, [prev[1]] if prev else []))
            runs[-1][1].append(pt)
            prev = (on, pt)
        for on, seg in runs:
            if len(seg) > 1:
                body.append(path(seg, "series s-bad" if on else "series s-off"))
        body.append(text(left, y0 - 5, label, "label strong"))
    bottom = top + len(names) * (row + gap) - gap
    for d in range(rm["days"]):
        body.append(text(xs(d * 1440 + 720), bottom + 18, (start + timedelta(days=d)).strftime("%a %-d"), "tick", "middle"))
    svg("rooms", h, "Temperature and heating in the three rooms we heat, 10 to 18 November",
        "Three rows, one per room, with the room temperature as a line, red while its radiator valve was open and grey "
        "while it was closed. The bedroom's valve is open far longer than the others; the living room and office heat in shorter spells.", body)


# 9. What condensing means (diagram) -------------------------------------------------------------
def condensing_diagram():
    h = 350
    body = ['<defs><marker id="cond-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
            'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="arrowhead"/></marker>'
            + "".join(f'<marker id="pipe-{k}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="2.6" markerHeight="2.6" '
                      f'orient="auto"><path d="M0,0 L10,5 L0,10 z" class="pipe-head-{k}"/></marker>' for k in ("cold", "warm", "hot"))
            + '</defs>']

    def arrow(d):
        body.append(f'<path d="{d}" class="arrow" marker-end="url(#cond-arrow)"/>')

    def pipe(d, kind):
        body.append(f'<path d="{d}" class="pipe pipe-{kind}" marker-end="url(#pipe-{kind})"/>')

    panels = [(0, "Return below 55 °C", "good-text", "box box-accent", ["vapour turns to water:", "its heat goes into the", "radiator water"],
               ["cooler, drier", "exhaust"]),
              (346, "Return above 55 °C", "bad-text", "box", ["too warm to condense:", "the vapour passes", "straight through"],
               ["hot, wet exhaust:", "that heat is lost"])]
    for card, title, tcls, ccls, cond_lines, flue_lines in panels:
        # Each case is its own card; ox is the left edge of its contents.
        ox = card + 10
        cx = ox + 93
        ret, ret_word = ("cold", "cool") if tcls == "good-text" else ("warm", "warm")
        body.append(rect(card, 1, 334, h - 2, "panel", 14))
        body.append(text(ox, 28, title, f"d-title {tcls}"))
        arrow(f"M{cx},114 L{cx},48")
        for k, s in enumerate(flue_lines):
            body.append(text(cx + 12, 70 + 17 * k, s, "d-note warn" if tcls == "bad-text" else "d-note"))
        body.append(rect(ox, 116, 186, 82, ccls, 10))
        body.append(text(ox + 12, 136, "Condensing exchanger", "d-title"))
        for k, s in enumerate(cond_lines):
            body.append(text(ox + 12, 154 + 15 * k, s, "d-note"))
        arrow(f"M{cx},232 L{cx},200")
        body.append(rect(ox, 234, 186, 44, "box", 10))
        body.append(text(ox + 12, 261, "Main exchanger", "d-title"))
        arrow(f"M{cx},294 L{cx},280")
        body.append(rect(ox, 296, 186, 40, "box box-muted", 10))
        body.append(text(ox + 12, 321, "Burner: gas + air", "d-note"))
        pipe(f"M{ox + 312},158 L{ox + 197},158", ret)
        body.append(text(ox + 198, 126, f"{ret_word} water back", f"d-note {ret_word}"))
        body.append(text(ox + 198, 141, "from the radiators", f"d-note {ret_word}"))
        pipe(f"M{ox + 188},256 L{ox + 300},256", "hot")
        body.append(text(ox + 198, 280, "hot water out to", "d-note warn"))
        body.append(text(ox + 198, 295, "the radiators", "d-note warn"))
    svg("condensing", h, "What condensing means",
        "Two side-by-side sketches of a condensing boiler. Exhaust from the burner rises through the main heat exchanger "
        "and then the condensing exchanger, where the cooler water coming back from the radiators enters. With the return "
        "below 55 °C the water vapour in the exhaust condenses and its heat goes into the water; above 55 °C it is too "
        "warm to condense and the heat leaves through the flue.", body)


# 10. What the restart band does (illustration from the measured medians) --------------------------
def band_diagram():
    cy = DATA["cycles"]
    h, left, right, panel = 356, 92, W - 10, 120
    window = 40  # minutes shown
    xs = scale(0, window, left, right)
    body = []
    # Run and pause lengths: medians of the measured runs and off gaps at each setting.
    rows = [("after", "−6 K", 54, "s-after"), ("after2", "−10 K", 50, "s-after2")]
    for r, (key, label, restart, cls) in enumerate(rows):
        top = 30 + r * (panel + 46)
        bottom = top + panel
        ys = scale(46, 68, bottom, top)
        on = DATA["cycles"][key]["median_min"]
        off = DATA["cycles"][key]["gap_median_min"]
        body.append(rect(left, ys(64), right - left, ys(restart) - ys(64), "zone", 0))
        body.append(line(left, ys(64), right, ys(64), "target"))
        body.append(line(left, ys(restart), right, ys(restart), "target"))
        body.append(text(left - 8, ys(64) + 4, "stop 64°", "tick", "end"))
        body.append(text(left - 8, ys(restart) + 4, f"restart {restart}°", "tick", "end"))
        pts, t, temp, firing = [], 0.0, restart, True
        starts = 0
        while t < window:
            dur = on if firing else off
            t1 = min(window, t + dur)
            frac = (t1 - t) / dur
            nxt = temp + (64 - restart) * frac * (1 if firing else -1)
            if firing:
                starts += 1
                body.append(rect(xs(t), bottom + 6, xs(t1) - xs(t), 8, f"{cls} solid", 2))
            pts += [(xs(t), ys(temp)), (xs(t1), ys(nxt))]
            t, temp, firing = t1, nxt, not firing
        body.append(path(pts, f"series {cls}"))
        body.append(text(left, top - 10, f"Restart band {label}: runs of about {on:.0f} min, pauses of about {off:.0f} min, "
                                         f"{starts} starts in {window} minutes", f"label strong {cls}-text"))
        body.append(text(left - 8, bottom + 15, "burner", "tick", "end"))
    for m in range(0, window + 1, 10):
        body.append(text(xs(m), h - 6, f"{m} min", "tick", "middle"))
    svg("band", h, "What the restart band does",
        "An illustration of the water temperature rising while the burner runs and falling while it rests, between the "
        "stop point at 64 °C and the restart point: 54 °C with the −6 K band, 50 °C with −10 K. Built from the median "
        "run and pause at each setting: the wider band gives longer runs, longer pauses and fewer starts.", body)


# 11. Who does what (diagram) --------------------------------------------------------------------
def setup_diagram():
    h = 352
    body = ['<defs><marker id="setup-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
            'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="arrowhead"/></marker>'
            + "".join(f'<marker id="setup-pipe-{k}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="2.6" markerHeight="2.6" '
                      f'orient="auto"><path d="M0,0 L10,5 L0,10 z" class="pipe-head-{k}"/></marker>' for k in ("cold", "hot"))
            + '</defs>']

    def box(x, y, w, hh, title, lines, cls="box"):
        body.append(rect(x, y, w, hh, cls, 10))
        body.append(text(x + 14, y + 25, title, "d-title"))
        for i, s in enumerate(lines):
            body.append(text(x + 14, y + 46 + 18 * i, s, "d-note"))

    def arrow(d):
        body.append(f'<path d="{d}" class="arrow" marker-end="url(#setup-arrow)"/>')

    box(0, 24, 190, 100, "Boiler", ["24 kW gas combi; a dial", "on the front sets the", "flow temperature"])
    box(490, 24, 190, 100, "Radiators", ["one per room, each", "with a tado valve that", "opens when it's cold"])
    body.append('<path d="M196.0,52.0 L482.0,52.0" class="pipe pipe-hot" marker-end="url(#setup-pipe-hot)"/>')
    body.append(text(340, 40, "flow: hot water out", "d-note warn", "middle"))
    body.append('<path d="M484.0,98.0 L198.0,98.0" class="pipe pipe-cold" marker-end="url(#setup-pipe-cold)"/>')
    body.append(text(340, 120, "return: cooler water back", "d-note cool", "middle"))
    box(0, 170, 190, 62, "EMS-ESP gateway", ["boiler data every 10 s"])
    box(245, 170, 190, 62, "Home Assistant", ["keeps all the history"])
    box(490, 170, 190, 62, "tado", ["room temperatures, valves"])
    arrow("M95.0,126.0 L95.0,168.0")
    arrow("M585.0,126.0 L585.0,168.0")
    arrow("M192.0,201.0 L243.0,201.0")
    arrow("M488.0,201.0 L437.0,201.0")
    box(100, 280, 220, 62, "AI agent", ["reads, explains, proposes"], "box box-accent")
    box(380, 280, 200, 62, "Me", ["decide, and turn the dial"])
    arrow("M300.0,234.0 L230.0,278.0")
    arrow("M322.0,311.0 L378.0,311.0")
    svg("setup", h, "Who does what",
        "The boiler sends hot water, the flow, to the radiators and gets cooler water, the return, back. A gateway reads "
        "the boiler and tado reads the rooms; both feed Home Assistant, which keeps the history. The AI agent reads that "
        "history, explains and proposes; I decide and turn the dial.", body)


# 13. Why it short-cycles: the burner's range against what the house needs (diagram) ----------------
def sizing_diagram():
    # From the tuning notes, not data.json: 24 kW nominal, modulation floor about 30 % (about 7 kW), and an
    # average heating need of about 2.3 kW on a mild day.
    max_kw, min_kw, need_kw = 24, 7, 2.3
    h, left, right = 166, 10, W - 10
    xs = scale(0, max_kw, left, right)
    body = []
    body.append(text(left, 18, f"What the house needs on a mild day: about {need_kw} kW", "label strong s-after2-text"))
    body.append(rect(xs(0), 28, xs(need_kw) - xs(0), 22, "s-after2 solid", 3))
    body.append(text(xs(min_kw), 82, f"What the burner can do: about {min_kw} to {max_kw} kW", "label strong s-before-text"))
    body.append(rect(xs(min_kw), 92, xs(max_kw) - xs(min_kw), 22, "s-before solid", 3))
    body.append(line(xs(min_kw), 24, xs(min_kw), 122, "target"))
    body.append(text(xs(min_kw) + 8, 44, "lowest flame: three times what's needed", "note"))
    body.append(line(left, 122, right, 122, "grid"))
    for v in range(0, max_kw + 1, 6):
        body.append(text(xs(v), 140, f"{v} kW", "tick", "middle"))
    svg("sizing", h, "The burner's range against what the house needs",
        "Two bars on a scale from 0 to 24 kW. The house needs about 2.3 kW on a mild day; the burner can only run "
        "between about 7 and 24 kW, so even its lowest flame is three times too much.", body)


for chart in (daily, trace, cycles, heatup, gas_cost, model_diagram, rooms, condensing_diagram, band_diagram,
              setup_diagram, sizing_diagram):
    chart()
print("wrote", ", ".join(sorted(p.name for p in DIR.glob("*.svg"))))
