# Edpire Integration Examples

Live working examples of the two main Edpire integration patterns.

**[Live demo →](https://your-demo.vercel.app)**

---

## Patterns

### Pattern A — Redirect *(recommended starting point)*

Send learners to the Edpire-hosted player. Your app constructs a URL, the learner completes the assessment, and Edpire redirects back with the score.

**When to use:** You want to embed assessments in under a day, or you want Edpire's full UI (timer, hints, rich media).

```
YOUR APP  →  redirect to https://{org}.edpire.com/take/{shareCode}?learner_ref=...&return_url=...
                       ↓ learner completes assessment
YOUR APP  ←  https://your-app.com/callback?submission_id=...&score=...&max_score=...
```

### Pattern B — Per-question API *(advanced)*

Fetch question content, render your own UI, and grade each answer in real-time via the `/check` endpoint. Answer keys never leave the Edpire server.

**When to use:** You need a custom look & feel, gamified flow (Duolingo-style), or per-question feedback.

```
YOUR APP  →  GET  /api/v1/assessments/:id      (fetch question content)
YOUR APP  →  POST /api/v1/assessments/:id/check (grade one question)
          ←  { correct, score, max_score, feedback }
```

---

## Setup

```bash
git clone https://github.com/your-org/edpire-integration-demo
cd edpire-integration-demo
npm install

cp .env.example .env.local
# Fill in your API key and org details in .env.local

npm run dev
# Open http://localhost:3000
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `EDPIRE_API_KEY` | Yes | API key from Settings → Integrations → API Keys |
| `EDPIRE_API_BASE_URL` | No | Default: `https://app.edpire.com` |
| `NEXT_PUBLIC_EDPIRE_TAKE_BASE_URL` | Pattern A | e.g. `https://your-org.edpire.com/take` |
| `NEXT_PUBLIC_APP_URL` | Pattern A | This app's public URL (for `return_url`) |

---

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/edpire-integration-demo)

Set the environment variables in the Vercel dashboard after deploying.

---

## Notes on Pattern B

This demo includes a **minimal built-in question renderer** that handles multiple-choice and fill-in-the-blank questions. In production, you'd likely use `@edpire/sdk/react` which provides:

- Full rendering of all question types (matching, math, open response, media)
- Accessibility features
- Answer state management

The `/check` endpoint API is the same regardless of which renderer you use.

---

## Security

- Your `EDPIRE_API_KEY` is never sent to the browser — all API calls are proxied through Next.js server routes.
- Answer keys are never returned by the `/check` endpoint.
- The `learner_ref` field is your internal user ID — use your authenticated user's ID in production.
