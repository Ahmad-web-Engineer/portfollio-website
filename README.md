# Portfolio + Resume (React, Vercel)
1. Push to GitHub, import in Vercel (Framework: Vite).
2. Storage tab > Add Upstash Redis. Admin key defaults to `123`. To change it: Settings > Environment Variables > ADMIN_KEY=<your secret> (if you already set ADMIN_KEY there, set it to `123` or delete it). Redeploy.
3. Site: your-domain/   Resume: /resume   Admin: /admin  (enter the admin key). Edits autosave to Redis, no redeploy needed.
Local: npm i, then `npm i -g vercel && vercel dev` (so /api works). Plain `npm run dev` runs with local-only saving.

Saving: edits autosave to Upstash Redis and are confirmed by reading them back (status shows 'Saved ✓ live'). The public site loads that saved copy on every visit, so changes appear for everyone without redeploying. If status shows 'Storage not connected', add Upstash Redis under Vercel > Storage, then redeploy once.
