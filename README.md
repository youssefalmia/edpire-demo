# Edpire Integration Demo

This repo now demonstrates three complementary integration patterns:

- `Library`: a learner-facing product demo where your platform owns evaluation cards, chapters, copy, and result pages while Edpire runs the assessment.
- `Builder`: an admin-style page with a right-side Edpire catalog panel, local wrapper entities, and an admin-side results sync view.
- `Simple Redirect`: the minimal possible redirect integration kept alongside the richer demo for comparison.

## What this repo is teaching

Edpire should usually own:

- assessment delivery
- grading
- share-code launches
- submission identifiers

Your platform should usually own:

- learner-facing entities like evaluations
- local metadata and access rules
- grouping and sequencing such as chapters
- result presentation and navigation
- persistence in your own database

This demo intentionally uses **temporary in-memory server state** for wrappers, assignments, and attempts so the architecture is easy to understand. In production, those records belong in your app database.

## Routes

- `/` landing page for the three demos
- `/library` redirect to the learner-facing evaluations experience
- `/library/evaluations` chapter-based local wrappers
- `/builder` admin-style wrapper builder with Edpire side panel
- `/simple-redirect` smallest viable redirect integration
- `/result/[attemptId]` standalone result page
- `/api/webhooks/edpire` minimal `submission.graded` webhook receiver

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000`.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `EDPIRE_API_KEY` | Yes | API key used to read assessments and verify submissions |
| `EDPIRE_API_BASE_URL` | No | Defaults to `https://edpire.com` |
| `NEXT_PUBLIC_EDPIRE_TAKE_BASE_URL` | Optional | Direct take base if you already know your exact take entrypoint |
| `NEXT_PUBLIC_EDPIRE_ORG_SLUG` | Redirect flows | Assigned org slug used for `https://{slug}.edpire.com` |
| `NEXT_PUBLIC_EDPIRE_TENANT_ORIGIN` | Optional | Explicit branded tenant origin, example: `https://your-org-slug.edpire.com` |
| `NEXT_PUBLIC_APP_URL` | Redirect flows | Public app URL used for `return_url` |
| `EDPIRE_WEBHOOK_SECRET` | Webhook demo | Used to verify `X-Edpire-Signature` |

## Notes

- The learner-facing and builder demos auto-seed a few local wrappers from the live assessment catalog once your API key is configured.
- The result flow verifies `submission_id` server-side with `GET /api/v1/submissions/:id`.
- The builder also demonstrates how a platform can pull assessment results from Edpire and cache them locally for reporting-style UI.
- The webhook endpoint is intentionally narrow: it only demonstrates `submission.graded`.
- Live webhook delivery during local development still requires a public URL or tunnel.
- The redirect examples now prefer a branded tenant URL like `https://{slug}.edpire.com/take/{shareCode}`.
- Teams should contact Edpire admin/support to get their slug assigned and tenant provisioned.

## Validation

```bash
npm run build
```
