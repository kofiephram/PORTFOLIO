# Portfolio

The portfolio uses Supabase as the shared source of truth for projects and images. Projects added from the website or directly in Supabase appear in the same `public.projects` table; Realtime keeps the open website synchronized with dashboard inserts, edits, and deletes.

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor**, run the updated [`supabase/schema.sql`](./supabase/schema.sql). It adds repository/demo links and the private rate-limit storage used by technical chat while keeping existing project records.
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
7. For technical Q&A, add `GEMINI_API_KEY` under **Project Settings → Edge Functions → Secrets** in Supabase. The key must not use a `VITE_` prefix or be placed in the frontend.
8. Deploy the chat function from the repository root with the Supabase CLI:

   ```sh
   supabase functions deploy tech-chat --project-ref YOUR_PROJECT_REF
   ```

   The model defaults to `gemini-2.5-flash`; optionally set `GEMINI_MODEL` as an Edge Function secret to select another supported Gemini model. The public endpoint accepts only short conversations, refuses non-technical questions, and limits each network to 12 requests per 10 minutes. Set usage limits for the Gemini key in Google AI Studio as an additional cost control.

Visitors can read project details and images without signing in. The configured admin signs in with Google from **Admin Login** to publish or delete projects from the website.

Admins can paste a **public** GitHub repository URL into the project form and choose **Import Repository**. The importer detects repository languages, topics, homepage, and likely screenshots; it pre-fills the project form, which remains editable before publishing. Private repositories are not supported. Detected repository images stay linked to their public GitHub raw URLs; screenshots selected from the computer are uploaded to Supabase Storage.

Each project card shows language percentages from GitHub when a public repository is available. If GitHub language data cannot be retrieved, the card shows a clearly labeled even estimate from the project's required technology tags. The footer summarizes the technology tags across all projects, with each percentage representing the share of projects using that technology.

## Managing projects in Supabase

Use the same project fields whether posting from the website or the Supabase dashboard:

- `title` and `description` are required.
- `link` is the project website or repository URL.
- `repo_url` stores the source repository and `demo_url` stores its deployed website (for example, a Vercel URL). `link` remains for compatibility with older project records.
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
