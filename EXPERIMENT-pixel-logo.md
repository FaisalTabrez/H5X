# Official H5X logo animation experiment

Local branch: `experiment/pixel-colour-mark`.

The supplied 6000 × 4142 transparent PNG is preserved byte-for-byte at `static/branding/h5x-logo-original.png`. `static/js/logo-mask.js` contains a 112 × 77 coverage/colour mask sampled from that asset. The homepage renderer uses the actual brushstroke outline instead of the previous block-letter approximation.

Three comparison modes:

- **Colour pixels:** flowing spectrum, crisp square tiles and subtle face shading.
- **Logo colours:** orange 5, with white strokes on dark backgrounds and dark strokes on light backgrounds.
- **ASCII:** the same brushstroke silhouette drawn with characters.

The selected mode is remembered locally and represented in the URL (`?mark=pixels`, `?mark=logo`, `?mark=ascii`). Gentle idle motion keeps the logo readable; dragging rotates it. Scatter throws the pixels outward and springs them back. Pause and reduced motion restore an assembled, static logo. Switching styles also assembles the logo for a fair comparison.

Run `npm run build` followed by `npm start`, or use `START-H5X.cmd`, then open http://127.0.0.1:8766/?mark=pixels. The generated `out/index.html` also works directly from disk as an offline preview.

Checked: script parsing, complete site build, asset checks, all three rendering choices, light/dark themes, and 390/320-pixel phone layouts. The original logo file is unchanged. This experiment is local and has not been pushed or deployed.
