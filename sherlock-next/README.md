This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Free trial

Visitors without their own OpenRouter key play on a metered free trial that uses the app's key.
The key and all limits live only in server-side environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | (unset = no trial) | The app's OpenRouter key. Server-only; never prefix it with `NEXT_PUBLIC_`. |
| `TRIAL_MODEL` | `z-ai/glm-5.3` | Model every trial request uses. |
| `TRIAL_TOKEN_LIMIT` | `30000` | Tokens per visitor (signed cookie), lifetime. |
| `TRIAL_IP_DAILY_TOKEN_LIMIT` | `90000` | Tokens per IP (IPv6 /64) per UTC day, so clearing cookies doesn't reset the trial. |
| `TRIAL_GLOBAL_DAILY_TOKEN_LIMIT` | `600000` | Tokens across all visitors per UTC day. |
| `TRIAL_GLOBAL_DAILY_USD_LIMIT` | `0.2` | OpenRouter spend across all visitors per UTC day. |
| `TRIAL_MAX_PROMPT_TOKENS` | `16000` | Largest prompt one trial request may send. |
| `TRIAL_COOKIE_SECRET` | derived from `API_KEY_SECRET` | Signs the trial cookie and hashes IPs. |

Usage is read from OpenRouter's `usage` field on every trial call and stored in the `trialusages`
MongoDB collection (see `lib/server/trial/`). If MongoDB is unreachable the trial is switched off
rather than left unmetered.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
