# Music Quiz (Prototype)

This is a minimal Next.js + Firebase music quiz prototype, adapted to run on Vercel's Node 22 runtime.

## Features

- Host lobby to create a game
- Players join via URL (you can generate QR code from the host screen)
- Simple artist guessing round:
  - Host starts a round, a random song from `lib/songs.json` is selected
  - Game state is set to `in-round` for 20 seconds
  - Players see an answer box and can type artist names with autocomplete
- Scores are tracked per player (scoring logic is not yet implemented in this prototype)

## Deploying

1. Push this folder to a GitHub repo (root must contain `package.json`, `next.config.js`, `pages/`, `components/`, `lib/`, `public/`).
2. In Vercel, import the repo as a **Next.js** project.
3. Set these environment variables:

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_DATABASE_URL
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

4. Deploy.

