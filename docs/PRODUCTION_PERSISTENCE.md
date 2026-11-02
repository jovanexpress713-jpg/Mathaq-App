# MAZAQ production persistence

## Supabase project
- Project: `mazaq-production`
- Project ref: `nvvbyswkrshqihtugtwa`
- Region: `ap-southeast-1`

## Durable state table
Migration `20261102182633_mazaq_durable_state_store` creates `public.mazaq_state`.
It is intentionally empty except for a single empty state row; no sample products, customers, orders, or financial records are seeded.

The table has Row Level Security enabled. A single explicit deny policy blocks `anon` and `authenticated`; table privileges are revoked from those roles. Only the server-side `service_role` has table privileges. Its key must never be placed in browser code or any `VITE_*` variable.

Migration `20261102182915_mazaq_state_access_and_cas` adds `mazaq_replace_state(expected_version, payload)`, a compare-and-swap primitive that only the `service_role` can execute. Migration `202611021831xx_mazaq_rls_policy_cleanup` consolidates the deny policy.

## Verified checks
- Supabase table exists and contains only the empty initialization row.
- RLS is enabled; browser roles have no table grants and are denied by policy.
- Supabase security advisor: no findings.
- Supabase performance advisor: no findings.
- GitHub Actions workflow `Verify storefront` passed for the two commits that added the initial schema and documentation.

## Important deployment gate
This is a database foundation, **not a completed application integration**. The current Express routes still call the synchronous JSON database in `server/db.ts`. They have **not** yet been converted to the asynchronous Supabase repository, and Vercel environment variables have **not** been configured. Do not enable live ordering or describe the store as production-ready until:
1. every read/write path is migrated and awaited;
2. order creation and stock/coupon changes are concurrency-safe;
3. admin and grocery sessions persist securely;
4. tests cover concurrent writes, restart persistence, authentication and order lifecycle;
5. the Vercel Express function is deployed and its API endpoints are verified.

The compare-and-swap RPC is only a primitive; the application does not call it yet. Do not mistake the existence of the RPC for an integrated repository.
