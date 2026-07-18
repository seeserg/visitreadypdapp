# VisitReady PD

A privacy-first, offline Progressive Web App that helps people living with Parkinson's disease prepare for neurology appointments — organizing symptoms, medications, blood pressure, falls, questions, and caregiver observations into an easy-to-read summary.

**VisitReady PD is not a medical device.** It does not diagnose disease or recommend medication changes. It is an organizational and communication tool.

## Principles

- **Privacy First** — no accounts, no cloud, no analytics, no tracking, no ads
- **Offline First** — works fully without a network connection once loaded
- **Accessibility First** — WCAG AA, large text mode, high contrast, keyboard navigation, reduced motion
- **No Account Required** — nothing to sign up for
- **No Cloud Storage** — everything lives in your browser's local IndexedDB
- **No Subscription** — free forever
- **Open Source** — MIT licensed

## Tech stack

React · TypeScript · Vite · Tailwind CSS · Radix UI primitives · React Router · Dexie (IndexedDB) · React Hook Form · Zod · pdf-lib · Recharts · vite-plugin-pwa

## Getting started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

The production build is fully static — deploy the contents of `dist/` to any static host. No backend, database, or server-side component is required.

## Data & privacy

All data (symptoms, medications, blood pressure, falls, questions, caregiver notes, and settings) is stored only in the browser's IndexedDB on the device where it was entered. Nothing is uploaded anywhere. Backups can be exported as plain JSON, password-encrypted JSON (AES-GCM via WebCrypto), or CSV — and restored from those files at any time.

## License

MIT
