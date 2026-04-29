# Love Garden

Next.js app for private memory gardens backed by Firebase Auth, Firestore, and Storage.

## Setup

Create `.env` with the public Firebase client config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Install and run:

```bash
pnpm install
pnpm dev
```

## Scripts

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Firebase Rules

Deployable rules are in:

- `firestore.rules`
- `storage.rules`

The Storage path convention is `gardens/{gardenId}/photos/{uploaderId}/{fileName}.webp`.
