# Slugsera dashboard operations

This project has two intentional boundaries:

- **Storefront design** lives in `src/sections`, `src/components`, and the public page files. Do not replace the existing hero, brand styling, or page structure when changing dashboard functionality.
- **Commerce data** lives in Supabase. The storefront and dashboard both read the same `public.products` records, so a successful dashboard save is the source of truth for the live site.

## Before running locally

Create an environment file with only the browser-safe Supabase values:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-anon-key>
```

Never add a Supabase service-role key to `VITE_*` variables or any browser code.

## Required database migration

Run `migrations/20260818_storefront_dashboard_upgrade.sql` once in the Supabase SQL Editor. It is additive and idempotent. It provides:

- `products.subcategory`
- `products.size_stock` as an array of `{ size, stock }`
- automatic `stock_quantity` totals based on `size_stock`
- protected `customer_events` analytics records
- profile creation from Supabase Auth and admin-only profile/event reads

The application will still load existing products that only have `stock_quantity`; it allocates that legacy total across the product's current sizes as an editable starting point. Enter exact size counts and save to make the inventory authoritative.

## Product workflow

1. Select one parent category: **T-Shirts**, **Shirts**, or **Hoodies**.
2. Select the subcategory that belongs to that parent.
3. Select offered sizes.
4. Enter quantity for every selected size. The total stock field is calculated and read-only.
5. Save and publish. Product description, inventory, and publication state update the same Supabase row read by the storefront.

`src/lib/queries.ts` and `src/hooks/useProducts.ts` intentionally write through the Supabase client. Do not route product mutations through `/api/admin/products`: the deployed static Vercel project does not serve that legacy Express route.

## Fresh storefront data

`useProducts` refetches when the storefront mounts or receives focus. Realtime is helpful when configured, but it is not required for a description change to appear after navigation or refresh. If a visitor has an already-open product page, refresh it once after an editor saves.

## Analytics and privacy

The storefront records only these events: page view, product click/view, size selection, quick add, add to cart, and signed-in session.

- Events contain product IDs, a random session ID, and minimal action metadata.
- Events do **not** store email addresses.
- A signed-in event contains an Auth user ID; the Analytics dashboard resolves the protected email list through `public.users` only for approved dashboard admins.
- Do not add raw emails, addresses, payment details, or other sensitive data to `customer_events.properties`.

If privacy legislation or a consent banner applies to the store, gate `trackCustomerEvent` behind the customer's analytics-consent setting before enabling non-essential tracking.

## Safe release checklist

1. Run `npm run build` from the repository root.
2. Confirm Supabase migration success and that product-image storage policies still allow admin upload/select/delete.
3. Check `/dashboard/products` while signed in as an admin.
4. Test a **draft** product: category/subcategory, exact size stock, description, publish/unpublish, and image upload. Remove the test draft afterward.
5. Refresh the corresponding storefront product page and verify the description and stock message.
6. Check `/dashboard/analytics` after an interaction; it should show real activity, never seeded/demo numbers.

## Deployment

The production project is `slugs-era-yr86`, which owns `www.slugsera.com`. Keep this mapping: another Vercel project has a different dashboard/UI and must not receive the custom domain.

Vercel Hobby deployments created from Git commits can be blocked when Git author attribution is not linked to the Vercel account. Resolve that account configuration or deploy with a short-lived personal token; revoke short-lived tokens and deploy hooks immediately after use.
