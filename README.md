# Portfolio

The portfolio uses Supabase as the shared source of truth for projects and images. Projects added from the website or directly in Supabase appear in the same `public.projects` table; Realtime keeps the open website synchronized with dashboard inserts, edits, and deletes.

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor**, run [`supabase/schema.sql`](./supabase/schema.sql).
3. In the **Authentication → Providers** settings, enable Google and configure its OAuth client credentials. Add your local and deployed site URLs to Supabase's allowed redirect URLs.
4. The schema seeds the single admin slot with `kofiephram@gmail.com`. If that is not the email on your Google account, update the slot in SQL Editor:

   ```sql
   update public.portfolio_admins
   set admin_email = 'your-google-email@example.com'
   where singleton = true;
   ```

   The database enforces a single admin slot; only a Google sign-in matching this email can publish or delete projects. The **Add admin** button is shown to the signed-in admin but remains disabled.
5. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the Supabase project's API settings. The anon/publishable key is intended for browser use; **never put a service-role key in the frontend**.
6. For a deployed site, add those same two environment variables and the deployed redirect URL to Supabase, then rebuild the app.

Visitors can read project details and images without signing in. The configured admin signs in with Google from **Admin Login** to publish or delete projects from the website.

## Managing projects in Supabase

Use the same project fields whether posting from the website or the Supabase dashboard:

- `title` and `description` are required.
- `link` is the project website or repository URL.
- `tags` is a PostgreSQL `text[]`, for example `{"HTML","CSS"}`.
- `images` is a `text[]` of public image URLs. Alternatively, leave `images` empty and put Storage object paths in `image_paths`; the website resolves those paths through the public `portfolio-project-images` bucket.
- `image_paths` is a `text[]` of object paths within that bucket (do not include the bucket name).

To add a project directly, upload its JPG, PNG, WebP, or GIF image (up to 5 MB) to **Storage → portfolio-project-images**, copy the public URL or object path, then insert a row in **Table Editor → public.projects**. For example, with a public URL:

```sql
insert into public.projects (title, description, link, tags, images)
values (
  'My project',
  'A short description of the project.',
  'https://example.com',
  array['HTML', 'CSS'],
  array['https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/portfolio-project-images/path/to/image.jpg']
);
```

Inserting through the website uploads the selected screenshots to that same bucket and records their public URLs and object paths in the same row. Direct dashboard changes appear in the website automatically when Realtime is enabled by the schema; refreshing the page also reloads the table.

If deleting a row directly from the Table Editor, also remove its objects from Storage to avoid leaving unused image files behind.

## Development

```sh
npm install
npm run dev
```

Run `npm test`, `npm run lint`, and `npm run build` to validate changes.
