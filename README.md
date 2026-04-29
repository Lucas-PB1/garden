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
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Add the private server config for checkout/admin:

```bash
ADMIN_EMAILS=your-email@example.com
ADMIN_UIDS=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=
MERCADO_PAGO_WEBHOOK_URL=
MERCADO_PAGO_CHECKOUT_URL_MODE=sandbox
```

`FIREBASE_SERVICE_ACCOUNT` or `FIREBASE_SERVICE_ACCOUNT_BASE64` can be used instead of
`FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY`.

The default sale config is stored in Firestore at `commerce/config`. Until changed in `/admin`,
the app uses BRL 0.10 (`priceCents: 10`) for testing.

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

`gardens` creation now requires an active document in `entitlements/{uid}`. The entitlement is only
written by the server after Mercado Pago confirms an approved payment with the expected value and
currency.

## Mercado Pago Flow

- `/checkout` creates a server-side order and a Checkout Pro preference.
- `/api/mercado-pago/webhook` validates `x-signature`, fetches the payment from Mercado Pago, and
  compares `external_reference`, amount and currency against the order.
- Only matching `approved` payments grant access in `entitlements/{uid}`.
- `amount_mismatch`, `currency_mismatch`, refunds and chargebacks do not grant active access.
