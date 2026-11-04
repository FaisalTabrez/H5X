# Official H5X logo animation

Developed on `experiment/pixel-colour-mark`; the approved logo-colour version is merged into `main` for Vercel and GitHub Pages.

The supplied 6000 × 4142 transparent PNG is preserved byte-for-byte at `static/branding/h5x-logo-original.png`. `static/js/logo-mask.js` contains a 112 × 77 coverage/colour mask sampled from that asset. The homepage renderer uses the actual brushstroke outline instead of the previous block-letter approximation.

Two comparison modes:

- **Logo colours (default):** orange 5, with white strokes on dark backgrounds and dark strokes on light backgrounds. Crisp square pixels and subtle face shading retain the supplied logo's identity.
- **ASCII:** the same brushstroke silhouette drawn with characters.

The selected mode is remembered locally and represented in the URL (`?mark=logo` or `?mark=ascii`). Older multicolour links/preferences fall back to logo colours. Gentle idle motion keeps the logo readable; dragging rotates it. Scatter throws the pixels outward and springs them back. Pause and reduced motion restore an assembled, static logo. Switching styles also assembles the logo for a fair comparison.

Run `npm run build` followed by `npm start`, or use `START-H5X.cmd`, then open http://127.0.0.1:8766/?mark=logo. The generated `out/index.html` also works directly from disk as an offline preview.

Checked: script parsing, complete site build, asset checks, rendering choices, light/dark themes, and 390/320-pixel phone layouts. The original logo file is unchanged. The multicolour option has been removed; logo colours are the default.
