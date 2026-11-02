# Portfolio

Vite + React + Supabase. Admin at `/admin`.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env`
3. `npm run dev`

## Make yourself admin
1. Supabase > Authentication > Users > Add user (email + password). Turn off public sign-ups.
2. Sign in at `/admin`. It shows your user id and the SQL line to run in the SQL editor:
   `insert into public.admin_users (user_id) values ('<your-user-id>');`

## Deploy to Vercel (free tier)
1. Push this folder to GitHub.
2. Vercel > Add New > Project > import the repo (Vite is detected automatically).
3. Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Deploy. `vercel.json` rewrites all routes so refreshing project pages works.
5. Supabase > Authentication > URL Configuration: add your `*.vercel.app` URL as the Site URL.
