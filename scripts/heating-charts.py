#!/usr/bin/env python3
"""Render the SVG charts for the heating post from assets/posts/heating-with-ai/data.json.

    python3 scripts/heating-charts.py

The SVGs carry no colours of their own: classes map to the site's theme variables
(`.chart` rules in assets/css/main.css), so they follow light and dark mode. The post inlines
them with the `chart` shortcode.
"""
import json
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape

DIR = Path(__file__).resolve().parent.parent / "assets" / "posts" / "heating-with-ai"
DATA = json.loads((DIR / "data.json").read_text())
W = 680


def svg(name, height, title, desc, body):
    out = (
        f'<svg viewBox="0 0 {W} {height}" role="img" aria-labelledby="{name}-t {name}-d" '
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
        x += 30 + 7.2 * len(label)


# 1. Condensing share per day ---------------------------------------------------------------
def daily():
    days = DATA["daily"]
    h, top, bottom, left, right = 300, 46, 250, 44, W - 10
    ys = scale(0, 100, bottom, top)
    body = []
    legend(body, left, 18, [("s-before", "69 °C flow"), ("s-change", "change day"), ("s-after", "60 °C flow")])
    y_axis(body, ys, [0, 25, 50, 75, 100], left, right, lambda v: f"{v}%")
    body.append(line(left, ys(60), right, ys(60), "target"))
    body.append(text(left + 4, ys(60) - 6, "good: over 60 %", "note"))
    slot = (right - left) / len(days)
    for i, d in enumerate(days):
        day = datetime.strptime(d["day"], "%Y-%m-%d")
        cls = "s-before" if day.day < 13 else ("s-change" if day.day == 13 else "s-after")
        v = d["condensing_pct"]
        x = left + i * slot + slot * 0.22
        bw = slot * 0.56
        body.append(rect(x, ys(v), bw, bottom - ys(v), f"{cls} solid", 3))
        body.append(text(x + bw / 2, ys(v) - 7, f"{v}%", "value", "middle"))
        body.append(text(x + bw / 2, bottom + 18, day.strftime("%a %-d"), "tick", "middle"))
        if d["relay_offline_h"] >= 1:
            body.append(text(x + bw / 2, bottom + 34, f"relay off {d['relay_offline_h']:.0f} h", "note warn", "middle"))
    svg("daily", h, "Share of heating time spent condensing, per day",
        "Bars per day from 10 to 16 November. 25 to 31 percent while the flow was 69 °C, 53 percent on the change day, "
        "93 to 97 percent at 60 °C.", body)


# 2. Flow and return over three hours of a night, before and after ------------------------------
def trace():
    h, panel, gap, left, right = 470, 160, 74, 44, W - 10
    body = []
    legend(body, left, 18, [("s-flow", "flow (water leaving the boiler)"), ("s-ret", "return (water coming back)")])
    for p, key in enumerate(["before", "after"]):
        t = DATA["trace"][key]
        top = 52 + p * (panel + gap)
        bottom = top + panel
        xs = scale(0, 180, left, right)
        ys = scale(35, 75, bottom, top)
        body.append(rect(left, ys(55), right - left, bottom - ys(55), "zone"))
        y_axis(body, ys, [40, 50, 60, 70], left, right, lambda v: f"{v}°")
        body.append(line(left, ys(55), right, ys(55), "target"))
        body.append(text(left + 6, bottom - 6, "condensing zone, below 55 °C", "note"))
        pts = t["points"]
        starts, on = 0, None
        for i, (m, fl, rt, firing) in enumerate(pts):
            if firing and (i == 0 or not pts[i - 1][3]):
                on, starts = m, starts + 1
            if on is not None and (not firing or i == len(pts) - 1):
                body.append(rect(xs(on), top - 9, xs(m) - xs(on), 5, "burner solid", 1))
                on = None
        body.append(path([(xs(m), ys(min(max(fl, 35), 75))) for m, fl, _, _ in pts if fl is not None], "series s-flow"))
        body.append(path([(xs(m), ys(min(max(rt, 35), 75))) for m, _, rt, _ in pts if rt is not None], "series s-ret"))
        for m in (0, 60, 120, 180):
            body.append(text(xs(m), bottom + 16, ["00:00", "01:00", "02:00", "03:00"][m // 60], "tick", "middle"))
        body.append(text(left, top - 16, f"{t['label']}: {starts} burner starts in 3 hours, {t['outdoor']:.0f} °C outside", "label strong"))
    svg("trace", h, "Boiler flow and return temperature between midnight and 3 am, at 69 °C and at 60 °C",
        "Two panels. At 69 °C the return rarely drops below 55 °C. At 60 °C the whole sawtooth sits in the condensing zone, "
        "but the burner still starts every few minutes.", body)


# 3. Where the return temperature sat while the burner was heating --------------------------------
def return_hist():
    h, top, bottom, left, right = 300, 40, 252, 44, W - 10
    rh = DATA["return_hist"]
    lo, hi = 38, 72
    shares = {k: {int(t): 100 * m / rh[k]["total_min"] for t, m in rh[k]["minutes"].items()} for k in rh}
    ymax = 25
    xs = scale(lo, hi, left, right)
    ys = scale(0, ymax, bottom, top)
    body = [rect(left, top, xs(55) - left, bottom - top, "zone")]
    y_axis(body, ys, [0, 5, 10, 15, 20, 25], left, right, lambda v: f"{v}%")
    for key, cls in (("before", "s-before"), ("after", "s-after")):
        pts = [(xs(lo), ys(0))]
        for t in range(lo, hi):
            v = shares[key].get(t, 0)
            pts += [(xs(t), ys(v)), (xs(t + 1), ys(v))]
        pts.append((xs(hi), ys(0)))
        body.append(path(pts, f"area {cls}"))
    body.append(line(xs(55), top, xs(55), bottom, "target"))
    body.append(text(xs(55) - 6, top - 8, "← condensing", "note", "end"))
    body.append(text(xs(55) + 6, top - 8, "not condensing →", "note"))
    for t in range(40, hi + 1, 5):
        body.append(text(xs(t), bottom + 18, f"{t} °C", "tick", "middle"))
    body.append(text(xs(44.5), ys(15), "60 °C flow", "label strong s-after-text", "middle"))
    body.append(text(xs(44.5), ys(15) + 16, f"{rh['after']['condensing_pct']:.0f} % below 55 °C", "label s-after-text", "middle"))
    body.append(text(xs(68.5), ys(15), "69 °C flow", "label strong s-before-text", "middle"))
    body.append(text(xs(68.5), ys(15) + 16, f"{rh['before']['condensing_pct']:.0f} % below 55 °C", "label s-before-text", "middle"))
    svg("return-temps", h, "Return water temperature while the burner was heating, as a share of firing time",
        "Distribution of return temperature. At 69 °C most firing time had the return between 55 and 65 °C; "
        "at 60 °C it moved to 46 to 54 °C.", body)


# 4. Burner cycle lengths -----------------------------------------------------------------
def cycles():
    h, top, bottom, left, right = 290, 46, 240, 44, W - 10
    cy = DATA["cycles"]
    labels = [b[0] for b in cy["before"]["bins"]]
    pct = {k: [100 * n / cy[k]["n"] for _, n in cy[k]["bins"]] for k in cy}
    ys = scale(0, 40, bottom, top)
    body = []
    legend(body, left, 18, [("s-before", f"69 °C ({cy['before']['n']} cycles)"), ("s-after", f"60 °C ({cy['after']['n']} cycles)")])
    y_axis(body, ys, [0, 10, 20, 30, 40], left, right, lambda v: f"{v}%")
    slot = (right - left) / len(labels)
    for i, lab in enumerate(labels):
        x0 = left + i * slot + slot * 0.16
        bw = slot * 0.32
        for j, key in enumerate(("before", "after")):
            v = pct[key][i]
            body.append(rect(x0 + j * bw, ys(v), bw - 3, bottom - ys(v), f"s-{key} solid", 2))
        body.append(text(left + (i + 0.5) * slot, bottom + 18, lab, "tick", "middle"))
    body.append(text(left + (right - left) / 2, bottom + 40, "minutes per burner run", "note", "middle"))
    x5 = left + 4 * slot
    body.append(line(x5, top - 4, x5, bottom, "target"))
    body.append(text(x5 - 8, top + 10, f"under 5 min: {cy['before']['under5_pct']} % → {cy['after']['under5_pct']} %", "label strong", "end"))
    svg("cycles", h, "How long each burner run lasted, at 69 °C and at 60 °C",
        "Grouped bars of run length. The two distributions are almost identical: about three quarters of runs are shorter "
        "than five minutes either way.", body)


# 5. Living Room warming up with the valve fully open ------------------------------------------
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
        ly = ys(0.33 - 0.14 * row) + 4
        lx = xs(54)
        body.append(path([(lx, ly - 4), (lx + 24, ly - 4)], f"series {cls}"))
        body.append(text(lx + 32, ly, f"{r['label']}: {rate:.2f} °C/h", f"label strong {cls.split()[0]}-text"))
        body.append(text(right, ly, f"flow {r['mean_flow']:.0f} °C, {r['outdoor']:.0f} °C outside", "note", "end"))
    svg("heatup", h, "Living Room warming up in the morning with its valve fully open",
        "Temperature rise since the valve opened fully. At 69 °C the room rose 1.3 °C in 75 minutes; at 60 °C it rose "
        "0.9 °C in 80 minutes and 0.9 °C in 125 minutes, on milder mornings.", body)


# 6. The relay outages ----------------------------------------------------------------------
def relay():
    h, top, bottom, left, right = 280, 46, 228, 44, W - 10
    rows = DATA["relay_hourly"]
    n = len(rows)
    xs = scale(0, n, left, right)
    ys = scale(0, 60, bottom, top)
    body = []
    legend(body, left, 18, [("s-after", "burner minutes per hour, relay online"), ("s-before", "relay offline (shaded)")])
    i = 0
    while i < n:
        if rows[i][2] < 0.5:
            j = i
            while j < n and rows[j][2] < 0.5:
                j += 1
            body.append(rect(xs(i), top, xs(j) - xs(i), bottom - top, "offline"))
            i = j
        else:
            i += 1
    y_axis(body, ys, [0, 20, 40, 60], left, right, lambda v: f"{v}")
    bw = (right - left) / n
    for i, (hour, mins, online) in enumerate(rows):
        cls = "s-after" if online >= 0.5 else "s-before"
        body.append(rect(xs(i) + 0.6, ys(mins), bw - 1.2, bottom - ys(mins), f"{cls} solid", 1))
        stamp = datetime.strptime(hour, "%Y-%m-%dT%H")
        if stamp.hour == 0 or i == 0:
            body.append(line(xs(i), bottom, xs(i), bottom + 5, "axis"))
            body.append(text(xs(i) + 4, bottom + 18, stamp.strftime("%a %-d" if stamp.hour == 0 else "%a %-d, %H:%M"), "tick"))
    svg("relay", h, "Burner minutes per hour from 13 to 16 November, with the tado relay's outages shaded",
        "Hourly bars. The relay was offline for about 26 of the 72 hours. During the long overnight outage the burner ran "
        "about 35 minutes an hour; during the Saturday afternoon outage it did not run at all.", body)


for chart in (daily, trace, return_hist, cycles, heatup, relay):
    chart()
print("wrote", ", ".join(sorted(p.name for p in DIR.glob("*.svg"))))
