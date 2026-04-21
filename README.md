# Absolutely Brilliant — QR Feedback Router

Web app for collecting customer feedback and managing rewards.

## What is in this repo

- `frontend/` — React + TypeScript + Vite app
- `backend/` — Flask API (including Stripe routes)
- `firestore.rules` and `firestore.indexes.json` — Firestore config for deployment

## Quick start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Useful scripts (from `frontend/package.json`):

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

## Environment variables (backend)

Used by `backend/app.py` and `backend/stripe_routes.py`:

- `FIREBASE_KEY_PATH`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_MONTHLY`
- `STRIPE_PRICE_ID_YEARLY`
- `FRONTEND_URL` (defaults to `http://localhost:5173`)
- `PORT` (defaults to `5000`)

Example `.env`:

```env
FIREBASE_KEY_PATH=/absolute/path/to/service-account.json
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_YEARLY=price_xxx
FRONTEND_URL=http://localhost:5173
PORT=5000
```

## Firestore rules and indexes

This repo includes:

- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`

Deploy from repo root:

```bash
firebase deploy --project <PROJECT_ID> --only firestore:rules,firestore:indexes
```

## Notes

- Frontend Firebase project config is in `frontend/src/firebaseConfig.ts`.
- If you see Firebase permission errors, verify the deployed project ID matches `frontend/src/firebaseConfig.ts`.

## Resources

- Firebase CLI: https://firebase.google.com/docs/cli
- Firestore rules: https://firebase.google.com/docs/firestore/security/get-started
- Firestore indexes: https://firebase.google.com/docs/firestore/query-data/indexing
- Stripe Checkout: https://stripe.com/docs/payments/checkout
