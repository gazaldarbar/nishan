# The Watchlist

A personal IMDb ratings archive — 6,767 titles, browsable by category.

## Structure
```
index.html       Home page
movies.html       Movies, split by language
series.html       Series, split into Indian / Other
css/style.css      All styling (black & white theme)
js/app.js       Shared search/sort/render logic
data/movies.json  Movie records grouped by language
data/series.json  Series records grouped by category
```

## Hosting on GitHub Pages
1. Push this folder to a repo.
2. Repo Settings → Pages → Source: deploy from branch → pick `main` (or wherever this lives) and `/ (root)`.
3. Your site will be live at `https://<username>.github.io/<repo>/`.

No build step — it's plain HTML/CSS/JS, so it just works as static files.

## About the language categorization
Your IMDb export doesn't include a language field, and there's no reliable
way to fetch it in bulk from the web for 6,349 movies. So language was
guessed from the **director's name** — a curated list of ~350 directors
mapped to the language they're known for. This covers about 57% of movies
confidently. The rest sit under **Unsorted** in movies.html.

Series have no director field at all in the export, so the Indian/Other
split is a best-effort match against a curated list of ~70 recognizable
Indian show titles. A few may be miscategorized.

### To fix a miscategorized title
Open `data/movies.json` or `data/series.json` (plain JSON, one object per
title), find the entry, and move it from one category's array to another
by cutting/pasting the object between the top-level keys (e.g. from
`"Unsorted": [...]` into `"Tamil": [...]`). Any text editor works — no
rebuild needed, just save and refresh.

If you want to reclassify at scale instead of by hand, both JSON files
are flat enough to open in a script (Python's `json` module) and bulk-move
entries by title or director.
