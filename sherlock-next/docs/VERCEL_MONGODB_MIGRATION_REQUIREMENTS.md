# Vercel Deployment & MongoDB Migration Requirements

This document outlines the necessary steps to migrate the Sherlock Holmes AI web app from its current local file-based storage to a serverless-compatible architecture suitable for deployment on Vercel.

## The Problem
Currently, the application uses local JSON files to store data:
- `data/users.json` (User accounts, passwords, settings, avatars)
- `data/chats.json` (Chat histories and conversations)
- `data/characters.json` (Available AI characters)

Vercel's Serverless Functions provide a **read-only filesystem**. Any data written to local dummy files via `fs.writeFileSync` will be lost as soon as the functional execution ends. Therefore, to persist user sessions, profiles, and chats in production, the application must use a real database.

## Requirements for the Next Agent

### 1. Database Selection
- The user has approved migrating to **MongoDB Atlas (M0 Free Tier)**.
- MongoDB was chosen because its document-based NoSQL architecture is practically a 1:1 match with the existing nested JSON data structures, requiring minimal structural schema changes.

### 2. Mongoose Integration
- Install `mongoose`.
- Create a global database connection utility (e.g., `lib/mongodb.ts`) that implements connection caching. This is critical in Next.js serverless environments to prevent exhausting database connections during hot reloads or parallel requests.

### 3. Schema Design
Create Mongoose schemas that mirror the existing JSON footprints:
- **User Schema**: `username`, `email`, `password_hash`, `displayName`, `avatar`, `created_at`.
- **Chat Schema**: `user_id` (linking to the User), `title`, `preview`, `full_content` (can remain stringified JSON for seamless compatibility with current frontend parser types), `character`, `created_at`.

### 4. API Route Refactoring
Find all instances in `app/api/**/*.ts` that use `fs.readFileSync`, `fs.writeFileSync`, or `fs.existsSync` and replace them with Mongoose database operations (`find`, `findOne`, `create`, `updateOne`).
Specifically, target:
- `app/api/auth/register/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/user/route.ts`
- `app/api/user/profile/route.ts`
- `app/api/chats/route.ts`
- `app/api/chats/[id]/route.ts`

### 5. Deployment Preparation checklist
- Ensure no native `fs` logic leaks into edge functions or client components.
- Have the user create a free MongoDB Atlas cluster.
- Have the user retrieve their connection string.
- Add `MONGODB_URI` to the `.env.local` for local testing.
- Add `MONGODB_URI` to the Vercel project environment variables.
- Deploy via Vercel GitHub integration.
