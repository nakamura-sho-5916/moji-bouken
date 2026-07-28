from __future__ import annotations

import struct
import zlib
from collections import deque
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source-assets" / "source-assetsenemy-sheet-001-010.png.png"
OUTPUT_DIR = ROOT / "public" / "assets" / "game" / "enemies"
CANVAS_SIZE = 512
PADDING = 28


SPRITES = [
    ("001-moji-slime.png", (25, 210, 158, 326)),
    ("002-ink-slime.png", (172, 210, 308, 326)),
    ("003-paper-slime.png", (322, 210, 460, 326)),
    ("004-moji-bat.png", (483, 210, 617, 326)),
    ("005-ink-bat.png", (628, 210, 760, 326)),
    ("006-moji-wolf.png", (785, 209, 914, 326)),
    ("007-paper-goblin.png", (935, 210, 1040, 326)),
    ("008-ink-goblin.png", (1058, 210, 1188, 326)),
    ("009-dakuten-ghost.png", (1210, 210, 1338, 326)),
    ("010-hatena-ghost.png", (1364, 210, 1490, 326)),
]


def paeth(left: int, up: int, upper_left: int) -> int:
    estimate = left + up - upper_left
    distance_left = abs(estimate - left)
    distance_up = abs(estimate - up)
    distance_upper_left = abs(estimate - upper_left)
    if distance_left <= distance_up and distance_left <= distance_upper_left:
        return left
    if distance_up <= distance_upper_left:
        return up
    return upper_left


def read_png(path: Path) -> tuple[int, int, list[tuple[int, int, int, int]]]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path} is not a PNG file")

    offset = 8
    width = height = bit_depth = color_type = None
    compressed = bytearray()

    while offset < len(data):
        length = struct.unpack(">I", data[offset : offset + 4])[0]
        chunk_type = data[offset + 4 : offset + 8]
        chunk_data = data[offset + 8 : offset + 8 + length]
        offset += 12 + length

        if chunk_type == b"IHDR":
            width, height, bit_depth, color_type, compression, filter_method, interlace = struct.unpack(
                ">IIBBBBB", chunk_data
            )
            if bit_depth != 8 or color_type not in (2, 6) or compression != 0 or filter_method != 0 or interlace != 0:
                raise ValueError("Only non-interlaced 8-bit RGB/RGBA PNG files are supported")
        elif chunk_type == b"IDAT":
            compressed.extend(chunk_data)
        elif chunk_type == b"IEND":
            break

    if width is None or height is None or color_type is None:
        raise ValueError("PNG header is missing")

    channels = 4 if color_type == 6 else 3
    bytes_per_pixel = channels
    stride = width * channels
    raw = zlib.decompress(bytes(compressed))
    rows: list[bytearray] = []
    cursor = 0

    for _ in range(height):
        filter_type = raw[cursor]
        cursor += 1
        row = bytearray(raw[cursor : cursor + stride])
        cursor += stride
        prior = rows[-1] if rows else bytearray(stride)

        for index in range(stride):
            left = row[index - bytes_per_pixel] if index >= bytes_per_pixel else 0
            up = prior[index]
            upper_left = prior[index - bytes_per_pixel] if index >= bytes_per_pixel else 0
            if filter_type == 1:
                row[index] = (row[index] + left) & 0xFF
            elif filter_type == 2:
                row[index] = (row[index] + up) & 0xFF
            elif filter_type == 3:
                row[index] = (row[index] + ((left + up) // 2)) & 0xFF
            elif filter_type == 4:
                row[index] = (row[index] + paeth(left, up, upper_left)) & 0xFF
            elif filter_type != 0:
                raise ValueError(f"Unsupported PNG filter: {filter_type}")
        rows.append(row)

    pixels: list[tuple[int, int, int, int]] = []
    for row in rows:
        for index in range(0, len(row), channels):
            r, g, b = row[index : index + 3]
            a = row[index + 3] if channels == 4 else 255
            pixels.append((r, g, b, a))
    return width, height, pixels


def write_png(path: Path, width: int, height: int, pixels: list[tuple[int, int, int, int]]) -> None:
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        start = y * width
        for r, g, b, a in pixels[start : start + width]:
            raw.extend((r, g, b, a))

    def chunk(kind: bytes, payload: bytes) -> bytes:
        return (
            struct.pack(">I", len(payload))
            + kind
            + payload
            + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)
        )

    payload = b"".join(
        [
            b"\x89PNG\r\n\x1a\n",
            chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)),
            chunk(b"IDAT", zlib.compress(bytes(raw), 9)),
            chunk(b"IEND", b""),
        ]
    )
    path.write_bytes(payload)


def crop(
    pixels: list[tuple[int, int, int, int]], width: int, box: tuple[int, int, int, int]
) -> tuple[int, int, list[tuple[int, int, int, int]]]:
    left, top, right, bottom = box
    cropped_width = right - left
    cropped_height = bottom - top
    cropped: list[tuple[int, int, int, int]] = []
    for y in range(top, bottom):
        start = y * width + left
        cropped.extend(pixels[start : start + cropped_width])
    return cropped_width, cropped_height, cropped


def is_connected_background(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    if a == 0:
        return True
    return min(r, g, b) >= 232 and max(r, g, b) - min(r, g, b) <= 24


def transparentize_outer_background(
    width: int, height: int, pixels: list[tuple[int, int, int, int]]
) -> list[tuple[int, int, int, int]]:
    result = pixels[:]
    seen = [False] * len(result)
    queue: deque[tuple[int, int]] = deque()

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        if x < 0 or x >= width or y < 0 or y >= height:
            continue
        index = y * width + x
        if seen[index]:
            continue
        seen[index] = True
        if not is_connected_background(result[index]):
            continue
        r, g, b, _ = result[index]
        result[index] = (r, g, b, 0)
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

    return result


def trim_alpha(
    width: int, height: int, pixels: list[tuple[int, int, int, int]]
) -> tuple[int, int, list[tuple[int, int, int, int]]]:
    opaque_points = [
        (index % width, index // width)
        for index, pixel in enumerate(pixels)
        if pixel[3] > 0
    ]
    if not opaque_points:
        return width, height, pixels
    left = max(min(x for x, _ in opaque_points) - 1, 0)
    right = min(max(x for x, _ in opaque_points) + 2, width)
    top = max(min(y for _, y in opaque_points) - 1, 0)
    bottom = min(max(y for _, y in opaque_points) + 2, height)
    return crop(pixels, width, (left, top, right, bottom))


def resize(
    width: int, height: int, pixels: list[tuple[int, int, int, int]], target_width: int, target_height: int
) -> list[tuple[int, int, int, int]]:
    if width == target_width and height == target_height:
        return pixels[:]

    result: list[tuple[int, int, int, int]] = []
    x_ratio = width / target_width
    y_ratio = height / target_height
    for y in range(target_height):
        source_y = min(int(y * y_ratio), height - 1)
        row_start = source_y * width
        for x in range(target_width):
            source_x = min(int(x * x_ratio), width - 1)
            result.append(pixels[row_start + source_x])
    return result


def place_on_canvas(
    width: int, height: int, pixels: list[tuple[int, int, int, int]]
) -> list[tuple[int, int, int, int]]:
    usable = CANVAS_SIZE - PADDING * 2
    scale = min(usable / width, usable / height)
    target_width = max(1, round(width * scale))
    target_height = max(1, round(height * scale))
    scaled = resize(width, height, pixels, target_width, target_height)
    canvas = [(255, 255, 255, 0)] * (CANVAS_SIZE * CANVAS_SIZE)
    offset_x = (CANVAS_SIZE - target_width) // 2
    offset_y = (CANVAS_SIZE - target_height) // 2
    for y in range(target_height):
        destination = (offset_y + y) * CANVAS_SIZE + offset_x
        source = y * target_width
        canvas[destination : destination + target_width] = scaled[source : source + target_width]
    return canvas


def main() -> None:
    width, _, pixels = read_png(SOURCE)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for filename, box in SPRITES:
        cropped_width, cropped_height, cropped_pixels = crop(pixels, width, box)
        transparent = transparentize_outer_background(cropped_width, cropped_height, cropped_pixels)
        trimmed_width, trimmed_height, trimmed = trim_alpha(cropped_width, cropped_height, transparent)
        canvas = place_on_canvas(trimmed_width, trimmed_height, trimmed)
        write_png(OUTPUT_DIR / filename, CANVAS_SIZE, CANVAS_SIZE, canvas)
        print(f"wrote {OUTPUT_DIR / filename}")


if __name__ == "__main__":
    main()
