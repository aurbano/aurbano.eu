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
        x += 30 + 7.9 * len(label)


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
    svg("daily", h, "Share of heating time spent condensing, per day",
        "Bars per day from 10 to 16 November. 25 to 31 percent while the flow was 69 °C, 53 percent on the change day, "
        "93 to 97 percent at 60 °C.", body)


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


# 3. Where the return temperature sat while the burner was heating --------------------------------
def return_hist():
    h, top, bottom, left, right = 300, 40, 252, 44, W - 10
    rh = DATA["return_hist"]
    lo, hi = 38, 72
    shares = {k: {int(t): 100 * m / rh[k]["total_min"] for t, m in rh[k]["minutes"].items()} for k in rh}
    ymax = 25
    xs = scale(lo, hi, left, right)
    ys = scale(0, ymax, bottom, top)
    body = [rect(left, top, xs(55) - left, bottom - top, "zone-good")]
    y_axis(body, ys, [0, 5, 10, 15, 20, 25], left, right, lambda v: f"{v}%")
    for key, cls in (("before", "s-before"), ("after", "s-after")):
        pts = [(xs(lo), ys(0))]
        for t in range(lo, hi):
            v = shares[key].get(t, 0)
            pts += [(xs(t), ys(v)), (xs(t + 1), ys(v))]
        pts.append((xs(hi), ys(0)))
        body.append(path(pts, f"area {cls}"))
    body.append(line(xs(55), top, xs(55), bottom, "target"))
    body.append(text(xs(55) - 6, top - 8, "← condensing (good)", "note good-text", "end"))
    body.append(text(xs(55) + 6, top - 8, "not condensing →", "note bad-text"))
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
        ly = ys(1.48 - 0.14 * row) + 4
        lx = xs(3)
        body.append(path([(lx, ly - 4), (lx + 24, ly - 4)], f"series {cls}"))
        body.append(text(lx + 32, ly, f"{r['label']}: {rate:.2f} °C/h", f"label strong {cls.split()[0]}-text"))
        body.append(text(right, ly, f"{r['mean_flow']:.0f} °C flow, {r['outdoor']:.0f} °C out", "note", "end"))
    svg("heatup", h, "Living Room warming up in the morning with its valve fully open",
        "Temperature rise since the valve opened fully. At 69 °C the room rose 1.3 °C in 75 minutes; at 60 °C it rose "
        "0.9 °C in 80 minutes and 0.9 °C in 125 minutes, on milder mornings.", body)


# 6. Measured gas against what the old settings would have used ------------------------------------
def gas_expected():
    h, top, bottom, left, right = 460, 58, 410, 50, W - 10
    gm = DATA["gas_model"]
    rm = gm["loo_rmse_kwh"]
    lo, hi = 0, 110
    xs = scale(lo, hi, left, right)
    ys = scale(lo, hi, bottom, top)
    body = []
    # Days with the heating controls offline for an hour or more are left out: the boiler was uncontrolled.
    days = [d for d in gm["nov2026"] if (d["relay_off_h"] or 0) < 1]
    items = [("s-base faint solid", "Nov 2024 (69 °C)")]
    items += [(f"{cls} solid", f"Nov 2026, {s}") for s, cls in (("69 °C", "s-before"), ("60 °C", "s-after")) if any(d["setting"] == s for d in days)]
    x = left
    for cls, label in items:
        body.append(f'<circle cx="{x + 6:.1f}" cy="13" r="5" class="{cls}"/>')
        body.append(text(x + 16, 17, label, "label"))
        x += 34 + 7.9 * len(label)
    # ±1 RMSE band around "as expected"
    band = [(xs(lo), ys(lo + rm)), (xs(hi - rm), ys(hi)), (xs(hi), ys(hi)), (xs(hi), ys(hi - rm)), (xs(lo + rm), ys(lo)), (xs(lo), ys(lo))]
    body.append(path(band + [band[0]], "zone"))
    for v in range(0, hi + 1, 20):
        body.append(line(left, ys(v), right, ys(v), "grid"))
        body.append(text(left - 8, ys(v) + 4, f"{v}", "tick", "end"))
        body.append(text(xs(v), bottom + 18, f"{v}", "tick", "middle"))
    body.append(line(xs(lo), ys(lo), xs(hi), ys(hi), "target"))
    body.append(text(xs(100), ys(100) - 8, "as expected", "note", "end"))
    body.append(text(xs(104), ys(60), "less gas than expected ↓", "note", "end"))
    body.append(text(xs(4), ys(72), "↑ more gas than expected", "note"))
    body.append(text((left + right) / 2, bottom + 40, "expected gas, kWh per day (old settings, same weather and indoor temperatures)", "note", "middle"))
    body.append(f'<text x="{left - 36}" y="{(top + bottom) / 2:.1f}" transform="rotate(-90 {left - 36} {(top + bottom) / 2:.1f})" text-anchor="middle" class="note">measured gas, kWh per day</text>')
    for e, a in gm["baseline"]:
        body.append(f'<circle cx="{xs(e):.1f}" cy="{ys(a):.1f}" r="3.5" class="s-base faint solid"/>')
    offsets = {"2026-11-10": (10, 15, "start"), "2026-11-11": (-10, 4, "end")}
    for d in days:
        series = "s-after" if d["setting"] == "60 °C" else "s-before"
        cx, cy = xs(d["expected"]), ys(d["actual"])
        body.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="5.5" class="{series} solid"/>')
        dx, dy, anchor = offsets.get(d["date"], (10, 4, "start"))
        body.append(text(cx + dx, cy + dy, datetime.strptime(d["date"], "%Y-%m-%d").strftime("%-d Nov"), "note", anchor))
    svg("gas-expected", h, "Measured daily gas against the gas the old boiler settings would have used",
        "Scatter of measured against expected daily gas. November 2024 days scatter around the diagonal within about "
        "10 kWh, and 10 and 11 November 2026 sit on it.", body)


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


for chart in (daily, trace, return_hist, cycles, heatup, gas_expected, model_diagram):
    chart()
print("wrote", ", ".join(sorted(p.name for p in DIR.glob("*.svg"))))
