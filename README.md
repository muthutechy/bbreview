# BeingBrief Review Generator

A full-stack SaaS starter app for ethical AI-assisted Google review writing.

This app helps real customers write reviews based on their own experience. It does **not** auto-post reviews to Google.

## Features

- Executive login using Google OAuth through NextAuth
- Business setup dashboard
- Service and location setup
- AI business analysis
- Public customer review generator page
- AI-generated short, medium, and casual review options
- Customer edit/copy flow
- Manual Google review posting button
- QR code generation
- WhatsApp share link
- Analytics tracking
- Safety warnings and real-experience confirmation

## Tech Stack

- Next.js App Router
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- NextAuth Google login
- OpenAI API

---

## 1. Install Requirements

Install:

- Node.js LTS
- PostgreSQL
- VS Code

Check versions:

```bash
node -v
npm -v
```

---

## 2. Install Project

```bash
cd beingbrief-review-generator
npm install
```

---

## 3. Create `.env`

Copy `.env.example` to `.env`.

```bash
cp .env.example .env
```

On Windows Command Prompt:

```cmd
copy .env.example .env
```

Update values:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/beingbrief_review?schema=public"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="create-a-strong-secret"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

OPENAI_API_KEY="your-openai-api-key"
```

---

## 4. Create PostgreSQL Database

Open pgAdmin or psql and create:

```sql
CREATE DATABASE beingbrief_review;
```

---

## 5. Run Prisma Migration

```bash
npx prisma generate
npx prisma migrate dev --name init
```

---

## 6. Start App

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 7. Google OAuth Setup

In Google Cloud Console:

1. Create project
2. Go to APIs & Services
3. OAuth consent screen
4. Create OAuth app
5. Add redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

6. Copy Client ID and Client Secret into `.env`

---

## Main Pages

```text
/                      Home
/login                 Executive login
/dashboard             Business dashboard
/dashboard/business/new Add business
/dashboard/business/[id] Business details + QR + review link
/r/[slug]              Public customer review generator
```

---

## Important Safety Rules

- Do not generate fake reviews
- Do not auto-post to Google
- Let customers edit the review
- Ask customer to confirm the review is real
- Avoid repeated review patterns
- Avoid overuse of keywords
- Support neutral and negative experiences also

---

## Production Deployment

Recommended:

- Vercel for frontend/backend
- Neon / Supabase / Railway PostgreSQL
- Google OAuth production redirect URI:

```text
https://yourdomain.com/api/auth/callback/google
```

Set all environment variables in Vercel.

---

## Notes

This is a starter project. For production, add:

- Email OTP login
- Admin-level billing system
- Business team invites
- Advanced duplicate detection
- OpenAI moderation/safety checks
- Rate limiting
- Proper audit logs
