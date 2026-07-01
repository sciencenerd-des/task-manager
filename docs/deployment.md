# Deployment Guide

## Services

- Vercel for the Next.js frontend
- Convex for backend/database/functions
- WorkOS AuthKit for authentication
- OpenAI for optional task parsing

## Environment variables

See `.env.local.example`.

Required values depend on the deployment target, but typically include:

```bash
NEXT_PUBLIC_CONVEX_URL=
WORKOS_API_KEY=
WORKOS_CLIENT_ID=
WORKOS_COOKIE_PASSWORD=
```

Optional:

```bash
OPENAI_API_KEY=
```

## Local development

```bash
npm install
npm run dev
```

## Validation

Offline checks that do not require a configured Convex deployment:

```bash
npm run lint
npm test
```

After configuring Convex and generating Convex types, also run:

```bash
npx convex codegen
npm run typecheck
```
