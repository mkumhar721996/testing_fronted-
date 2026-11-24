# Fonts

Files to be vendored. `tokens.css` declares `@font-face` for the paths below, but the files are not here yet (generation never downloads anything). Until they are added the pages render in the fallback stack of each `--font-family-*` token.

- `fonts/inter-400.woff2`: Inter 400
- `fonts/inter-600.woff2`: Inter 600
- `fonts/jetbrains-mono-400.woff2`: JetBrains Mono 400

Add the woff2 files (latin subset, the weights above) from each family's upstream release, in this directory, under these names. Every family listed in `manifest.json` is under an open licence (see its `licence`); keep the licence text of each family next to its files, as the licence requires, and do not sell the font files on their own.
