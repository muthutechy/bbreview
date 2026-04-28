# Setup Guide - BeingBrief Review Generator

## Step 1: Open Project

Extract ZIP, then open folder in VS Code.

```bash
cd beingbrief-review-generator
```

## Step 2: Install Packages

```bash
npm install
```

## Step 3: Setup Database

Install PostgreSQL and create database:

```sql
CREATE DATABASE beingbrief_review;
```

## Step 4: Configure Environment

Create `.env` from `.env.example`.

```cmd
copy .env.example .env
```

Edit:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/beingbrief_review?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-long-random-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
OPENAI_API_KEY="your-openai-api-key"
```

## Step 5: Google Login Setup

Google Cloud Console:

1. Create OAuth Client
2. Application type: Web application
3. Authorized redirect URI:

```text
http://localhost:3000/api/auth/callback/google
```

## Step 6: Prisma Migration

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## Step 7: Run

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Step 8: Test Flow

1. Login with Google
2. Go to Dashboard
3. Add business details
4. Add service names and locations
5. Open business detail page
6. Copy review link or scan QR
7. Customer selects service/location/experience
8. AI generates review options
9. Customer edits/copies
10. Customer opens Google review link and posts manually

## Common Issues

### Prisma authentication failed

Check PostgreSQL username/password in `DATABASE_URL`.

### Google OAuth error

Check redirect URI exactly:

```text
http://localhost:3000/api/auth/callback/google
```

### OpenAI not generating

Check `OPENAI_API_KEY`.

Without API key, app uses sample fallback review text.

### Port already used

Run:

```bash
npm run dev -- -p 3001
```

## Production Checklist

- Add rate limiting
- Add email OTP login
- Add admin panel
- Add payment/subscription system
- Add team invitation system
- Add audit logs
- Add duplicate detection using embeddings
- Add production Google redirect URI
- Use Neon/Supabase/Railway PostgreSQL
