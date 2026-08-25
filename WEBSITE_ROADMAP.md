# Slug's Era Website Readiness Roadmap

Last reviewed: 2026-08-25

## Launch baseline

- Publish Privacy Policy and Terms & Conditions and keep them visible in the footer.
- Load optional analytics only after explicit consent; keep cart, login, and security storage essential.
- Keep shopping CTAs, FAQ, contact, shipping, and returns easy to find.
- Give every public route a unique title, description, canonical URL, social metadata, and structured data where relevant.
- Keep `robots.txt` and the dynamic sitemap aligned with public routes and live products.
- Retain keyboard focus, semantic labels, one page-level heading, reduced-motion support, and meaningful image alternatives.
- Never simulate form success; validate on both client and server and show honest error states.
- Preserve route code-splitting, optimized WebP assets, long-lived image caching, and separated vendor bundles.

## Release checks

1. Run `npm run audit:site`, `npm run lint`, and `npm run build`.
2. Test home, collections, a product, FAQ, contact, privacy, terms, and a missing route at mobile and desktop widths.
3. Verify analytics is absent before consent and Cookie Settings can reopen the choice.
4. Test invalid contact/newsletter submissions and one authorized production delivery test.
5. Confirm deployed sitemap and robots URLs use `https://www.slugsera.com`.

## Monthly operations

- Review Core Web Vitals, checkout completion, search coverage, and broken links.
- Update sitemap entries whenever public routes change.
- Review legal text whenever payment, fulfilment, analytics, or data processors change.
- Test checkout, contact, newsletter, authentication, and payment after each major release.

## Production configuration

- Set `VITE_GA4_MEASUREMENT_ID` to the production GA4 ID.
- Configure SMTP values and `CONTACT_EMAIL` for contact delivery.
- Keep Supabase, Razorpay, allowed-origin, and domain values current.
- Have qualified counsel review the legal templates; they are operational content, not legal advice.
