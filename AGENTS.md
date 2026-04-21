# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js 15 demo for Edpire integration patterns. The live implementation currently covers the redirect flow, while the SDK pattern is represented as a disabled placeholder on the home page. Route files live in `app/`, with the active UI page under `app/redirect` and API proxies under `app/api`. Reusable client components live in `components/`, and shared API types/helpers live in `lib/edpire.ts`. Global styling is in `app/globals.css`; Tailwind and Next config sit at the repo root.

## Build, Test, and Development Commands
- `npm run dev`: start the local dev server on `http://localhost:3000`.
- `npm run build`: create a production build and catch TypeScript/App Router errors.
- `npm run start`: serve the production build after `npm run build`.

There is no dedicated `test` or `lint` script yet. Use `npm run build` as the minimum pre-PR validation step.

## Coding Style & Naming Conventions
Use TypeScript with strict mode enabled. Follow the existing style: 2-space indentation, double quotes, semicolon-free statements, and named exports for shared helpers/components. Keep route files named `page.tsx` or `route.ts` inside the App Router tree. Use `PascalCase` for React components, `camelCase` for functions/variables, and preserve the `@/*` import alias for cross-folder imports.

Tailwind is the primary styling approach. Prefer utility classes in JSX over adding one-off CSS unless a global rule belongs in `app/globals.css`.

## Testing Guidelines
Automated tests are not configured in this repo today. Before merging, run `npm run build` and manually verify the active demo flow:
- `/redirect` for the hosted-player handoff and callback flow

If you add tests, keep them close to the feature they cover and name them after the target module or route.

## Commit & Pull Request Guidelines
Recent history uses Conventional Commit prefixes such as `feat:`, `fix:`, and `chore:`. Keep commit subjects short and imperative, for example `fix: parse API error envelope correctly`.

PRs should include a brief summary, note any env var or API contract changes, and attach screenshots for UI changes. Link the relevant issue when one exists.

## Security & Configuration Tips
Keep secrets in local env files only; never commit `.env`. Use `.env.example` as the template, and keep `EDPIRE_API_KEY` server-side through the Next.js API routes rather than exposing it in client components.
