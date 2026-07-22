# Asset Guide

## Structure

Game artwork lives under `public/assets/game`.

- `enemies`: 512 x 512 original SVG enemy artwork
- `companions`: 512 x 512 original SVG companion artwork
- `backgrounds`: 1600 x 900 original SVG area backgrounds
- `items`: 256 x 256 original SVG item artwork
- `ui`: reserved for future original UI artwork

React code should not hard-code these paths in screens. Register assets in `src/features/assets/assetRegistry.ts` and resolve them through `src/features/assets`.

## Registry

Each asset has an `assetId`, `type`, `src`, `altText`, `fallbackEmoji`, colors, rarity, animation hint, and preload flag. Enemy, companion, background, and item assets also include the source game data ID they represent.

## Safety

SVG files must be original project artwork. Do not use external image URLs, copied character designs, `script`, `foreignObject`, or remote references. Keep SVG files lightweight and use simple vector shapes.

## Fallback

Use `GameAssetImage` for rendering. Unknown IDs and loading errors fall back to `AssetFallback`, so a missing image does not break the page.

## Debug

In development, open `/debug/assets` to inspect registry counts, filters, fallback rendering, and compact 320px display. Debug routes are disabled in production builds.

## PWA

Assets under `public/assets/game` are included in the production build output and can be cached by the Service Worker. Rebuilding after asset changes updates the generated `sw.js` precache manifest without deleting IndexedDB learning data.
