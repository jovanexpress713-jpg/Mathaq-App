# MAZAQ production persistence

## Supabase project
- Project: `mazaq-production`
- Project ref: `nvvbyswkrshqihtugtwa`
- Region: `ap-southeast-1`

## Durable state table
Migration `20261102182500_mazaq_durable_state_store.sql` creates `public.mazaq_state`.
It is intentionally empty except for a single empty state row; no sample products, customers, orders, or financial records are seeded.

The table has Row Level Security enabled. API access is revoked from `anon` and `authenticated`; only the server-side `service_role` can access it. Its key must never be placed in browser code or any `VITE_*` variable.

The `version` column is intended for optimistic concurrency control. A production repository must read the current version and update with a matching version predicate, retrying conflicts. A blind overwrite of the JSON document is not acceptable because simultaneous orders or admin edits could overwrite one another.

## Important deployment gate
This migration is infrastructure only. The current Express routes still call the synchronous JSON database in `server/db.ts`. They have **not** yet been converted to the asynchronous Supabase repository, and Vercel environment variables have **not** been configured. Do not enable live ordering or describe the store as production-ready until:
1. every read/write path is migrated and awaited;
2. order creation and stock/coupon changes are concurrency-safe;
3. admin and grocery sessions persist securely;
4. tests cover concurrent writes, restart persistence, authentication and order lifecycle;
5. the Vercel Express function is deployed and its API endpoints are verified.
