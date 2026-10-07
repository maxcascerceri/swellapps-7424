#!/usr/bin/env python3
"""Split the HD mascot into a still base plus independent eye and steam layers.

The master is a black-and-white JPEG. This keeps the drawing as raster (vectorizing
it sanded off the hand-drawn line) and only lifts the two eye dots and the four
coffee-steam strokes onto transparent overlays.

Run from the repo root:
  python3 packages/web/mascot-source/prepare-mascot.py
"""

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MASTER = ROOT / "mascot-source" / "mascot-master.jpg"
OUT = ROOT / "public" / "images" / "mascot"

# Dark enough to be linework, not paper. Background in the master sits at 252–255.
CORE_MAX = 110
PAPER_MIN = 249
HALO = 3


def luminance(rgb: tuple[int, int, int]) -> float:
    return (rgb[0] + rgb[1] + rgb[2]) / 3


def ink_alpha(level: float) -> int:
    if level >= PAPER_MIN:
        return 0
    if level <= 30:
        return 255
    tone = (PAPER_MIN - level) / (PAPER_MIN - 30)
    return max(0, min(255, int(round(255 * (tone ** 0.72)))))


def components(pixels, width: int, height: int):
    seen = [[0] * width for _ in range(height)]
    found = []
    current = 0
    neighbors = ((-1, -1), (0, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (0, 1), (1, 1))
    for y in range(height):
        for x in range(width):
            if seen[y][x] or luminance(pixels[x, y]) >= CORE_MAX:
                continue
            current += 1
            queue = deque([(x, y)])
            seen[y][x] = current
            points = []
            minx = maxx = x
            miny = maxy = y
            total_x = total_y = 0
            while queue:
                cx, cy = queue.popleft()
                points.append((cx, cy))
                total_x += cx
                total_y += cy
                minx, maxx = min(minx, cx), max(maxx, cx)
                miny, maxy = min(miny, cy), max(maxy, cy)
                for ox, oy in neighbors:
                    nx, ny = cx + ox, cy + oy
                    if 0 <= nx < width and 0 <= ny < height and not seen[ny][nx] and luminance(pixels[nx, ny]) < CORE_MAX:
                        seen[ny][nx] = current
                        queue.append((nx, ny))
            area = len(points)
            found.append(
                {
                    "id": current,
                    "points": points,
                    "area": area,
                    "bw": maxx - minx + 1,
                    "bh": maxy - miny + 1,
                    "cx": total_x / area,
                    "cy": total_y / area,
                }
            )
    return seen, found


def select_layers(found):
    eyes = [
        item
        for item in found
        if 80 <= item["area"] <= 180
        and item["bw"] <= 16
        and item["bh"] <= 20
        and 500 < item["cx"] < 660
        and 230 < item["cy"] < 280
    ]
    eyes.sort(key=lambda item: item["cx"])
    steam = [
        item
        for item in found
        if 250 <= item["area"] <= 800
        and item["bh"] > item["bw"] * 1.35
        and 280 < item["cx"] < 430
        and 250 < item["cy"] < 410
    ]
    steam.sort(key=lambda item: item["cx"])
    if len(eyes) != 2:
        raise SystemExit(f"Expected 2 eye dots, found {len(eyes)}")
    if len(steam) != 4:
        raise SystemExit(f"Expected 4 steam strokes, found {len(steam)}")
    return eyes, steam


def halo(core_ids, component_id: int, width: int, height: int, pixels):
    seeds = [(x, y) for y in range(height) for x in range(width) if core_ids[y][x] == component_id]
    mask = set(seeds)
    for x, y in seeds:
        for oy in range(-HALO, HALO + 1):
            for ox in range(-HALO, HALO + 1):
                nx, ny = x + ox, y + oy
                if not (0 <= nx < width and 0 <= ny < height):
                    continue
                owner = core_ids[ny][nx]
                if owner not in (0, component_id):
                    continue
                if luminance(pixels[nx, ny]) >= 253:
                    continue
                mask.add((nx, ny))
    return mask


def main():
    image = Image.open(MASTER).convert("RGB")
    width, height = image.size
    pixels = image.load()
    core_ids, found = components(pixels, width, height)
    eyes, steam = select_layers(found)

    eye_masks = [halo(core_ids, item["id"], width, height, pixels) for item in eyes]
    steam_masks = [halo(core_ids, item["id"], width, height, pixels) for item in steam]
    removed = set().union(*eye_masks, *steam_masks)

    base = Image.new("RGBA", (width, height))
    base_px = base.load()
    for y in range(height):
        for x in range(width):
            level = luminance(pixels[x, y])
            alpha = 0 if (x, y) in removed else ink_alpha(level)
            base_px[x, y] = (0, 0, 0, alpha)

    def write_mask(mask, name):
        layer = Image.new("RGBA", (width, height))
        layer_px = layer.load()
        for x, y in mask:
            layer_px[x, y] = (0, 0, 0, ink_alpha(luminance(pixels[x, y])))
        layer.save(OUT / name, optimize=True)

    OUT.mkdir(parents=True, exist_ok=True)
    base.save(OUT / "base.png", optimize=True)
    write_mask(eye_masks[0], "eye-left.png")
    write_mask(eye_masks[1], "eye-right.png")
    for index, mask in enumerate(steam_masks, start=1):
        write_mask(mask, f"steam-{index}.png")

    # Rest-pose composite should match the master. A large diff means a halo ate a neighbor.
    check = Image.new("RGBA", (width, height), (254, 254, 254, 255))
    for name in ("base.png", "eye-left.png", "eye-right.png", "steam-1.png", "steam-2.png", "steam-3.png", "steam-4.png"):
        layer = Image.open(OUT / name).convert("RGBA")
        check.alpha_composite(layer)
    diff = 0
    counted = 0
    check_px = check.load()
    for y in range(0, height, 2):
        for x in range(0, width, 2):
            original = luminance(pixels[x, y])
            if original >= PAPER_MIN:
                continue
            counted += 1
            diff += abs(original - luminance(check_px[x, y][:3]))
    mean = diff / max(1, counted)
    holes = 0
    for y in range(height):
        for x in range(width):
            if luminance(pixels[x, y]) < 40 and luminance(check_px[x, y][:3]) > 80:
                holes += 1
    print(f"eyes at {[round(item['cx']) for item in eyes]} / {[round(item['cy']) for item in eyes]}")
    print(f"steam at {[round(item['cx']) for item in steam]}")
    print(f"mean ink diff {mean:.2f} over {counted} samples; solid holes {holes}")
    for path in sorted(OUT.iterdir()):
        print(f"{path.stat().st_size:8} {path.name}")
    if holes:
        raise SystemExit("Rest-pose composite is missing solid ink from the master")


if __name__ == "__main__":
    main()
