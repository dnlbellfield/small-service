# Email Clarity V1 — Coastal Home Cleaning demo

A deliberately small, static lead-generation website for a fictional Ventura County residential cleaning business. It is a reusable implementation pattern, not a CRM. Replace every placeholder before use.

## What is implemented

| Area | Status |
| --- | --- |
| Responsive static site, accessible quote form, privacy, success and 404 pages | Implemented and locally testable |
| Netlify Forms storage, honeypot, browser validation | Implemented; requires a Netlify deploy to verify submission handling |
| Success-only GTM event and non-PII event hooks | Implemented; requires GTM/GA4 configuration and live verification |
| Server-side Brevo customer/owner mail webhook | Implemented; requires verified Brevo sender, environment variables, and a live webhook test |
| Domain, Search Console, consent configuration | Setup required |

## Deploy and configure

1. On the existing Netlify site, deploy this repository using `npm run build` and publish `dist/` (both are configured in `netlify.toml`). Netlify detects the static form in `dist/index.html` during deployment. Do not upload the source folder in place of the build output.
2. In Netlify, set the variables listed in `.env.example`. Do not upload or commit an `.env` file. Verify `BUSINESS_EMAIL` as a Brevo sender/domain first.
3. In Netlify Forms, confirm the `quote-request` form appears. On the deployed page, Netlify should have removed `data-netlify="true"` during processing and added/retained the hidden `form-name` field. If the attribute remains in deployed HTML, check the site's build command, publish directory, and form detection setting, then redeploy. Turn on spam filtering as appropriate.
4. Add a Netlify Forms outbound webhook pointing to `https://YOUR-SITE.netlify.app/.netlify/functions/brevo-form-webhook?token=FORM_WEBHOOK_TOKEN_VALUE`. If the Netlify UI supports custom headers, prefer `x-email-clarity-webhook-token` instead of placing the secret in the URL. Confirm the precise capability in the UI before enabling it; if it cannot protect the endpoint, use a small gateway (for example Make/Pipedream with a secret) or a dedicated signed webhook endpoint. Never expose the secret in the page.
5. Submit a real test inquiry on the existing netlify.app URL. Verify it appears in Netlify Forms before treating the success page or any email as proof of delivery.

Netlify Forms is the system of record. A Brevo outage returns an error to the webhook but does not remove the stored submission. The owner can follow up from Netlify Forms. For production-grade retry and strict deduplication, route the outbound webhook through a small durable queue/database with a submission-ID unique key, then call Brevo; this static starter intentionally does not pretend a serverless function has durable idempotency storage. Configure webhook retries only where the source supports them, and review failure alerts.

## Email copy

Customer confirmation subject: `We received your quote request — {{BUSINESS_NAME}}`

> Hi {{name}}, thanks for requesting a quote from {{BUSINESS_NAME}}. We received your inquiry and expect to respond within {{RESPONSE_TIMEFRAME}}. Your request is not an appointment booking. Reply to this email or contact {{BUSINESS_EMAIL}} if you need to add anything.

Owner notification subject: `New quote request: {{service}}`

It includes the submitted fields for manual follow-up. The function is server-side and does not put the Brevo key in browser code.

## GTM and GA4 event plan

Load GTM only after the visitor has provided the consent required for the launch jurisdiction. Add the GTM container snippet where marked in `index.html`; configure GA4 inside GTM rather than hard-coding an ID.

| Event | Trigger | Parameters allowed |
| --- | --- | --- |
| `quote_cta_click` | Any CTA with `data-quote-cta` | page path, UTM values if consented |
| `quote_form_start` | First focus inside the quote form | page path, UTM values if consented |
| `quote_form_success` | `thank-you/` load only | page path, UTM values if consented |

Never pass form fields, email, telephone, ZIP, message text, or query strings containing personal data to GTM/GA4. Preserve campaign attribution through standard UTM cookies/session attribution; do not append it to the success URL. In GA4, mark `quote_form_success` as the conversion after testing in DebugView. Use GTM Preview, browser network inspection, and GA4 DebugView to confirm events only after consent.

## Launch checklist

- [ ] Replace fictional name, phone, email, location, services, response timeframe, canonical URLs, `robots.txt`, and `sitemap.xml`.
- [ ] Register/connect the Namecheap domain in Netlify, set DNS records, and verify HTTPS/canonical redirects.
- [ ] Set production environment values in Netlify; verify the Brevo sender and test customer/owner delivery.
- [ ] Submit valid and invalid mobile/desktop form tests. Check Netlify spam behavior, stored form record, success page, and one email per accepted submission.
- [ ] Test Brevo failure: confirm the submission remains in Netlify Forms and document the manual follow-up process.
- [ ] Configure GTM consent, GA4 event tags, and verify there is no PII in analytics requests.
- [ ] Add the final domain property to Google Search Console, verify ownership, submit the sitemap, and inspect indexing/coverage.
- [ ] Have the owner review contact details, service areas, privacy notice, accessibility, and response process.

## Reusable client onboarding checklist

- [ ] Legal business name, primary contact, response promise, email, phone, service areas/ZIPs, services, and exclusions
- [ ] Domain registrar access and desired domain
- [ ] Netlify account access and production deployment owner
- [ ] Brevo account, verified sending domain, owner-notification address, and sender identity
- [ ] Privacy/consent requirements and final privacy-policy wording
- [ ] GTM, GA4, and Search Console access
- [ ] Test lead submitted and confirmation path signed off

## Local preview

Any static server can preview the pages, for example `npx serve .`. Local preview does not emulate Netlify Forms or the webhook. Avoid assuming live email, analytics, domain, or Search Console verification passed until their accounts are configured.
