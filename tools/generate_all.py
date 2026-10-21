"""Generate a template for every country of the Natural Earth admin-0 dataset.

Download the dataset (1:50m is plenty for a 10x10 emoji grid):
  curl -LO https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson

Then:
  python generate_all.py ne_50m_admin_0_countries.geojson

It writes public/templates/<country>.json and src/countries.json (the list
shown in the country selector). Hand-made templates listed in HAND_MADE are
kept as they are.

Each country keeps its main land mass plus the islands close to it (so France
keeps Corsica but not French Guiana, Portugal drops the Azores). CLIP fixes
the few countries where that rule doesn't give the usual map.
"""

import argparse
import json
import math
import re
from pathlib import Path

from shapely import affinity
from shapely.geometry import box, shape
from shapely.ops import unary_union

from svg_to_template import build_rows

ROOT = Path(__file__).resolve().parent.parent
TEMPLATES_DIR = ROOT / "public" / "templates"
COUNTRIES_INDEX = ROOT / "src" / "countries.json"

HAND_MADE = {"FR"}

# west, south, east, north
CLIP = {
    "US": (-125, 24, -66, 50),  # contiguous United States
}

# Natural Earth spellings we don't want to show.
RENAME = {"eSwatini": "Eswatini"}

# Natural Earth "Disputed" / "Indeterminate" entries that are shown.
INCLUDED = {"IL", "XK", "PS"}
EXCLUDED = {"AQ"}

# Islands farther than this (relative to the main land mass size) are dropped.
MAX_DISTANCE = 0.5
# Islands smaller than this (relative to the main land mass) are dropped.
MIN_AREA = 0.005
# If a country gets fewer emojis than this (thin or island countries), lower
# the land threshold so partly covered cells count too.
MIN_EMOJIS = 16
# Smallest emoji: ~10 km, about the resolution of the weather model.
MIN_CELL = 0.09


def flag(iso_a2):
    return "".join(chr(0x1F1E6 + ord(c) - ord("A")) for c in iso_a2.upper())


def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def is_country(props):
    iso = props["ISO_A2_EH"]
    if iso == "-99" or iso in EXCLUDED:
        return False
    if props["TYPE"] == "Sovereign country":
        return True
    if props["TYPE"] in {"Country", "Sovereignty"}:
        # e.g. keep "United States of America" but not Greenland or Aruba
        return props["ADMIN"] == props["SOVEREIGNT"]
    return iso in INCLUDED


def main_land(geometry):
    """Keep the largest polygon and the islands reachable from it."""
    polygons = list(getattr(geometry, "geoms", [geometry]))
    lat_mid = (geometry.bounds[1] + geometry.bounds[3]) / 2
    kx = math.cos(math.radians(lat_mid))
    flat = [affinity.scale(p, xfact=kx, origin=(0, 0)) for p in polygons]

    largest = max(range(len(flat)), key=lambda i: flat[i].area)
    size = math.sqrt(flat[largest].area)
    candidates = [i for i in range(len(flat)) if flat[i].area >= MIN_AREA * flat[largest].area]

    # Islands can be reached step by step (e.g. Indonesia), not only from the largest one.
    kept, frontier = {largest}, [largest]
    while frontier:
        current = frontier.pop()
        for i in candidates:
            if i not in kept and flat[i].distance(flat[current]) <= MAX_DISTANCE * size:
                kept.add(i)
                frontier.append(i)
    return unary_union([polygons[i] for i in kept])


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("geojson", help="Natural Earth admin-0 countries GeoJSON")
    parser.add_argument("--only", help="Comma-separated ISO codes to (re)generate, e.g. PT,ES")
    args = parser.parse_args()

    features = json.loads(Path(args.geojson).read_text())["features"]
    only = set(args.only.upper().split(",")) if args.only else None
    index = []

    for feature in features:
        props = feature["properties"]
        if not is_country(props):
            continue
        iso = props["ISO_A2_EH"]
        name = RENAME.get(props["ADMIN"], props["ADMIN"])
        file_name = slug(name) + ".json"
        index.append({"name": name, "icon": flag(iso), "template": file_name})

        if iso in HAND_MADE or (only and iso not in only):
            continue

        geometry = shape(feature["geometry"]).buffer(0)
        if iso in CLIP:
            geometry = geometry.intersection(box(*CLIP[iso]))
        geometry = main_land(geometry)

        threshold = 0.35
        while True:
            rows = build_rows(geometry, 10, 10, threshold, MIN_CELL)
            emojis = sum(1 for r in rows for i in r["items"] if i["type"] == "emoji")
            if emojis >= MIN_EMOJIS or (threshold < 0.02 and emojis > 0) or threshold < 1e-6:
                break
            threshold /= 2

        template = {"name": name, "icon": flag(iso), "rows": rows}
        (TEMPLATES_DIR / file_name).write_text(json.dumps(template, indent=2, ensure_ascii=False) + "\n")
        print(f"{iso}  {name:<32} {len(rows):>2} rows {emojis:>3} emojis  threshold {threshold:.3f}")

    index.sort(key=lambda c: c["name"].lower())
    COUNTRIES_INDEX.write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n")
    print(f"\n{len(index)} countries in {COUNTRIES_INDEX.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
