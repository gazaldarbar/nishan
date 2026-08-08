# The Watchlist

A personal IMDb ratings archive — browsable by category.

## Files
```
index.html         Home page
movies.html         Movies, split by language
series.html         Series, split into Indian / Other
style.css            All styling
app.js             Shared search/sort/render logic
movies.json           Movie records grouped by language
series.json           Series records grouped by category
update-data.html      Tool to regenerate movies.json/series.json from a new CSV
overrides.json      Manual corrections (starts empty)
```

All flat, no subfolders — upload them all directly into the repo root.

## Hosting on GitHub Pages
Repo Settings → Pages → Source: deploy from branch → `main` → `/ (root)` → Save.
Live at `https://<username>.github.io/<repo>/`.

## Updating monthly
1. Export your full ratings CSV from IMDb (Your Ratings → Export). It's
   always the complete list, not just new titles.
2. Open `update-data.html` in any browser (double-click it, or visit it on
   your live site). Nothing is uploaded anywhere — it all runs locally in
   the page.
3. Upload the new CSV. If you've corrected any titles before, also upload
   your current `overrides.json` there so those corrections carry forward.
4. Click Generate, download the resulting `movies.json` and `series.json`.
5. In GitHub: Add file → Upload files → drop in the two new JSON files
   (same names) → commit. Done — the live site updates immediately.

## Fixing a miscategorized title
Don't hand-edit the big JSON files. Instead edit `overrides.json`:
```json
{
  "movies": { "Some Movie Title": "Tamil" },
  "series": { "Some Show Title": "Indian" }
}
```
Valid movie values: Malayalam, Tamil, Telugu, Kannada, Hindi, Marathi,
Bengali, Assamese, English, Korean, Japanese, Spanish, French, German,
Russian, Thai, Iran, or Unsorted.
Valid series values: Indian or Other.

Upload this file into `update-data.html` next time you regenerate, and the
correction will be re-applied automatically — even to future CSV exports,
as long as the title text matches exactly.

## About the language categorization
IMDb's export has no language field. Movies are classified by matching the
director's name against a curated list (~550 directors) — this covers
about 57% of movies confidently; the rest land in **Unsorted**. Series have
no director field at all in the export, so Indian/Other is a best-effort
match against a curated list of recognizable Indian titles. Use
`overrides.json` to correct anything that's wrong.
