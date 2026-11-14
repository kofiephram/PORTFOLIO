# Portfolio

The portfolio keeps its built-in showcase projects in the app and stores newly published projects in Supabase. Project details and website links are saved in the `projects` table; screenshot files are uploaded to the public `portfolio-project-images` Storage bucket.

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor**, run [`supabase/schema.sql`](./supabase/schema.sql).
3. In the **Authentication → Providers** settings, enable Google and configure its OAuth client credentials. Add your local and deployed site URLs to Supabase's allowed redirect URLs.
4. In SQL Editor, set the one allowed administrator to your Google account email:

   ```sql
   update public.portfolio_admins
   set admin_email = 'your-google-email@example.com'
   where singleton = true;
   ```

   The database enforces a single admin slot; only a Google sign-in matching this email can publish or delete projects. The **Add admin** button is shown to the signed-in admin but remains disabled.
5. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the Supabase project's API settings. The anon/publishable key is intended for browser use; **never put a service-role key in the frontend**.
6. For a deployed site, add those same two environment variables and the deployed redirect URL to Supabase, then rebuild the app.

Visitors can read project details and images. Sign in with Google from **Admin Login** to publish or delete projects. New project screenshots must be uploaded as JPG, PNG, WebP, or GIF files (up to 5 MB each); they are stored in Supabase rather than in browser-local storage.

## Development

```sh
npm install
npm run dev
```

Run `npm test`, `npm run lint`, and `npm run build` to validate changes.
