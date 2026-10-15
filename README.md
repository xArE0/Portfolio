# PortfolioOS

Interactive Windows 11 style portfolio of Avishek Shrestha, built with React, TypeScript, Tailwind CSS and Vite.

## Scripts

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check and build
npm run lint     # eslint
```

## Content

Projects and achievements are discovered at build time:

```
src/content/projects/<slug>/meta.json       + media files
src/content/achievements/<slug>/meta.json   + media files
```

Add a folder with a `meta.json` and rebuild — no code changes needed.

Deep links: `#about`, `#projects`, `#terminal`, `#settings`, `#achievements`, `#music`, `#contact`, `#certificate/<slug>`.
