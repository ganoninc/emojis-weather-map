"""Generate an Emoji Weather Map template from a country shape.

The shape is either an SVG (which has no geography, so you give its
geographic bounds and projection) or a GeoJSON file (already in lon/lat).

How it works:
  1. The shape is projected to a local plane where 1 unit is the same
     distance horizontally and vertically (longitude * cos(mid latitude)).
  2. It is cut into horizontal bands, one per emoji row.
  3. In each band, emojis are placed so they cover as much land as possible.
     Horizontal positions are snapped to the renderer's offset spaces
     (one emoji is ~5.27 offset spaces wide, see EmojiWeatherMap.scss).
  4. Each emoji gets the centroid of the land under it as its coordinates,
     so coastal cells query the weather on land, not at sea.

Examples:
  python svg_to_template.py shapes/portugal.svg --bounds=-9.4797,37.0054,-6.2125,42.1374 \
      --name Portugal --icon 🇵🇹 --out ../public/templates/portugal.json
  python svg_to_template.py countries.geojson --feature PRT --clip=-10,36,-6,43 --name Portugal ...
"""

import argparse
import json
import math
from pathlib import Path

from shapely.geometry import Polygon, box, shape
from shapely.ops import transform, unary_union
from shapely import affinity

# Width of one emoji in offset spaces (58pt emoji / 11pt space at xl breakpoint).
OFFSETS_PER_EMOJI = 5.27


# ---------------------------------------------------------------------------
# Loading shapes (always returned as a lon/lat shapely geometry)
# ---------------------------------------------------------------------------

def load_svg(path, bounds, projection, samples_per_segment):
    """Read every filled shape of an SVG and georeference it with `bounds`."""
    from svgelements import SVG, Path as SvgPath, Shape, Move, Close

    svg = SVG.parse(str(path))
    rings = []
    for element in svg.elements():
        if not isinstance(element, Shape):
            continue
        svg_path = abs(SvgPath(element))  # abs() applies transforms
        ring = []
        for segment in svg_path:
            if isinstance(segment, Move):
                if len(ring) >= 3:
                    rings.append(ring)
                ring = [(segment.end.x, segment.end.y)]
            elif isinstance(segment, Close):
                if len(ring) >= 3:
                    rings.append(ring)
                ring = []
            else:
                n = 1 if type(segment).__name__ == "Line" else samples_per_segment
                for i in range(1, n + 1):
                    p = segment.point(i / n)
                    ring.append((p.x, p.y))
        if len(ring) >= 3:
            rings.append(ring)

    if not rings:
        raise ValueError(f"No shapes found in {path}")

    # Even-odd fill: nested rings become holes (lakes), separate rings islands.
    geometry = Polygon()
    for ring in rings:
        geometry = geometry.symmetric_difference(Polygon(ring).buffer(0))

    # Map SVG coordinates to lon/lat using the shape's bounding box.
    sx0, sy0, sx1, sy1 = geometry.bounds
    west, south, east, north = bounds

    if projection == "mercator":
        def to_y(lat):
            return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))

        def from_y(y):
            return math.degrees(2 * math.atan(math.exp(y)) - math.pi / 2)
    else:
        def to_y(lat):
            return lat

        def from_y(y):
            return y

    top, bottom = to_y(north), to_y(south)

    def svg_to_lonlat(x, y):
        lon = west + (x - sx0) / (sx1 - sx0) * (east - west)
        lat = from_y(top - (y - sy0) / (sy1 - sy0) * (top - bottom))
        return lon, lat

    return transform(lambda xs, ys: tuple(zip(*map(svg_to_lonlat, xs, ys))), geometry)


def load_geojson(path, feature):
    data = json.loads(Path(path).read_text())
    features = data.get("features", [data])
    if feature:
        wanted = feature.lower()
        features = [
            f for f in features
            if any(str(v).lower() == wanted for v in f.get("properties", {}).values())
        ]
        if not features:
            raise ValueError(f"No feature with a property equal to {feature!r}")
    return unary_union([shape(f["geometry"]) for f in features])


# ---------------------------------------------------------------------------
# Laying out the emojis
# ---------------------------------------------------------------------------

def best_row_layout(land, x0, y_top, cell, max_slots, threshold):
    """Choose where to put emojis in one row.

    Returns a list of ("offset", n) / ("emoji", cell_geometry) items. Emojis
    are placed with a small dynamic program: walking left to right, either
    skip one offset space or place an emoji. Placing an emoji scores
    (land fraction under it - threshold), and we keep the best total.
    """
    unit = cell / OFFSETS_PER_EMOJI
    band = box(x0, y_top - cell, x0 + (max_slots + OFFSETS_PER_EMOJI) * unit, y_top)
    row_land = land.intersection(band)
    if row_land.is_empty:
        return []

    cell_area = cell * cell
    cache = {}

    def emoji_cell(m, k):
        left = x0 + (m + k * OFFSETS_PER_EMOJI) * unit
        return box(left, y_top - cell, left + cell, y_top)

    def gain(m, k):
        if (m, k) not in cache:
            cache[(m, k)] = row_land.intersection(emoji_cell(m, k)).area / cell_area - threshold
        return cache[(m, k)]

    max_emojis = int(max_slots / OFFSETS_PER_EMOJI) + 1
    # best[(m, k)] = best score from state (m offsets used, k emojis placed) to the end.
    best = {}
    for m in range(max_slots, -1, -1):
        for k in range(max_emojis, -1, -1):
            if m + k * OFFSETS_PER_EMOJI > max_slots:
                best[(m, k)] = (0.0, None)
                continue
            options = [(best.get((m + 1, k), (0.0, None))[0], "offset")]
            if k < max_emojis:
                options.append((gain(m, k) + best.get((m, k + 1), (0.0, None))[0], "emoji"))
            best[(m, k)] = max(options, key=lambda o: o[0])

    items, m, k = [], 0, 0
    while best.get((m, k), (0.0, None))[1] is not None and best[(m, k)][0] > 0:
        if best[(m, k)][1] == "emoji":
            items.append(("emoji", emoji_cell(m, k)))
            k += 1
        else:
            if items and items[-1][0] == "offset":
                items[-1] = ("offset", items[-1][1] + 1)
            else:
                items.append(("offset", 1))
            m += 1
    return items


def build_rows(geometry, max_rows, max_columns, threshold, min_cell=0.0):
    """min_cell: smallest emoji size in degrees of latitude, so tiny countries
    don't get dozens of emojis querying the same weather."""
    lat_mid = (geometry.bounds[1] + geometry.bounds[3]) / 2
    kx = math.cos(math.radians(lat_mid))
    land = affinity.scale(geometry, xfact=kx, yfact=1, origin=(0, 0))

    minx, miny, maxx, maxy = land.bounds
    cell = max((maxy - miny) / max_rows, (maxx - minx) / max_columns, min_cell)
    n_rows = math.ceil((maxy - miny) / cell)
    y_start = (maxy + miny) / 2 + n_rows * cell / 2
    x0 = minx - cell / 2  # leave room so the first emoji can be centered on the coast
    max_slots = math.ceil((maxx - x0 + cell / 2) / cell * OFFSETS_PER_EMOJI)

    rows = []
    for r in range(n_rows):
        layout = best_row_layout(land, x0, y_start - r * cell, cell, max_slots, threshold)
        items = []
        for kind, value in layout:
            if kind == "offset":
                items.append({"type": "offset", "length": value})
                continue
            under = land.intersection(value)
            point = under.centroid
            if not under.buffer(1e-9).contains(point):
                point = under.representative_point()
            items.append({
                "type": "emoji",
                "geographicCoordinates": {
                    "latitude": round(point.y, 6),
                    "longitude": round(point.x / kx, 6),
                },
            })
        if items and items[0]["type"] != "offset":
            items.insert(0, {"type": "offset", "length": 0})
        rows.append({"items": items})

    # Trim empty rows at the edges; keep inner ones (with one space so they
    # keep their height) to preserve gaps, e.g. between mainland and islands.
    while rows and not rows[0]["items"]:
        rows.pop(0)
    while rows and not rows[-1]["items"]:
        rows.pop()
    # Drop the blank margin shared by every row so the map can be centered.
    margin = min((row["items"][0]["length"] for row in rows if row["items"]), default=0)
    for row in rows:
        if row["items"]:
            row["items"][0]["length"] -= margin
    for row in rows:
        if not row["items"]:
            row["items"] = [{"type": "offset", "length": 1}]
    return rows


def preview(rows):
    """Terminal preview: 🟩 per emoji, offset spaces scaled to emoji width."""
    lines = []
    for row in rows:
        line, pos = "", 0.0
        for item in row["items"]:
            if item["type"] == "offset":
                pos += item["length"] / OFFSETS_PER_EMOJI
            else:
                line += " " * max(0, round(pos * 2) - len(line) - line.count("🟩"))
                line += "🟩"
                pos += 1
        lines.append(line)
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("shape", help="Country shape: .svg or .geojson/.json")
    parser.add_argument("--name", required=True, help="Country name, e.g. Portugal")
    parser.add_argument("--icon", default="", help="Flag emoji, e.g. 🇵🇹")
    parser.add_argument("--out", help="Output JSON file (default: print preview only)")

    svg = parser.add_argument_group("SVG input")
    svg.add_argument("--bounds", help="Geographic bounding box of the shape: west,south,east,north")
    svg.add_argument("--projection", choices=["equirectangular", "mercator"],
                     default="equirectangular", help="Projection the SVG was drawn in")
    svg.add_argument("--curve-samples", type=int, default=8,
                     help="Points used to approximate each curve segment")

    geo = parser.add_argument_group("GeoJSON input")
    geo.add_argument("--feature", help="Keep features having a property equal to this (e.g. PRT)")

    parser.add_argument("--clip", help="Only keep land inside west,south,east,north "
                                       "(e.g. to drop overseas territories)")
    parser.add_argument("--rows", type=int, default=10, help="Maximum number of emoji rows")
    parser.add_argument("--columns", type=int, default=10, help="Maximum number of emojis per row")
    parser.add_argument("--threshold", type=float, default=0.35,
                        help="Minimum land fraction under an emoji (0-1)")
    args = parser.parse_args()

    def bbox(value):
        return tuple(float(v) for v in value.split(","))

    path = Path(args.shape)
    if path.suffix.lower() == ".svg":
        if not args.bounds:
            parser.error("SVG input needs --bounds=west,south,east,north")
        geometry = load_svg(path, bbox(args.bounds), args.projection, args.curve_samples)
    else:
        geometry = load_geojson(path, args.feature)

    if args.clip:
        geometry = geometry.intersection(box(*bbox(args.clip)))

    rows = build_rows(geometry, args.rows, args.columns, args.threshold)
    emojis = sum(1 for row in rows for item in row["items"] if item["type"] == "emoji")

    print(preview(rows))
    print(f"\n{len(rows)} rows, {emojis} emojis (= {emojis} weather API calls)")

    if args.out:
        template = {"name": args.name, "icon": args.icon, "rows": rows}
        Path(args.out).write_text(json.dumps(template, indent=2, ensure_ascii=False) + "\n")
        print(f"Wrote {args.out}")


if __name__ == "__main__":
    main()
