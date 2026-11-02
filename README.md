# Portfolio — GitHub Pages

The built website is in the `docs/` folder. GitHub Pages serves it directly — no build step needed.

## Publish
1. Create a new **public** GitHub repository (any name, e.g. `portfolio`).
2. Upload everything from this folder (drag the files and folders in, or use GitHub Desktop).
3. Repository **Settings → Pages → Build and deployment**: Source = **Deploy from a branch**, Branch = **main**, folder = **/docs**, then **Save**.
4. After 1–2 minutes your site is live at `https://<username>.github.io/<repo-name>/`.

## Admin dashboard (edit without code)
- Your site address + `#/admin` (e.g. `https://<username>.github.io/portfolio/#/admin`).
- In Supabase: Authentication → Users → Add user (email + password).
- Sign in at the admin page; it shows one line of SQL. Run it once in Supabase → SQL Editor to make yourself admin.
- Then add/edit/reorder projects, upload covers and edit site content.

## Changing the code later (optional)
`npm install`, copy `.env.example` to `.env`, `npm run dev` to preview, `npm run build` to refresh `docs/`, then commit the updated `docs/` folder.
