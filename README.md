# Premium Harvest

Modern Bangla organic mango e-commerce site built with Next.js 16 App Router, TypeScript, Tailwind CSS, Framer Motion, Firebase Auth, Firestore, and Storage.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Add Firebase web app keys and Admin SDK service account values.
3. Create Firestore collections: `products`, `orders`, `gallery`, `contacts`, `admins`.
4. Add an admin document at `admins/{firebaseAuthUid}`.
5. Deploy `firestore.rules` and `storage.rules`.
6. Install and run:

```bash
npm install
npm run dev
```

Public site content is in Bangla. If Firebase Admin credentials are absent, pages use built-in demo mango data so the site remains previewable.
