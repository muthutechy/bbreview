# BeingBrief Review Generator - Safe Update Notes

This update keeps your current app flow and structure, and only adds/fixes the requested items:

## Added

1. **Edit Business**
   - Open a business from dashboard
   - Click **Edit Business**
   - Update business details, services, locations, review link, tone, and languages

2. **Delete Business**
   - Available at the bottom of the Edit Business page
   - Deletes business with services, locations, analytics, and review sessions

3. **Loading animation during review generation**
   - Spinner
   - Progress bar
   - Changing loading messages

4. **Regenerate fixed**
   - Regenerate now calls AI again instead of only hiding old reviews

5. **Warning removed**
   - Removed the bottom over-optimized warning from the review page UI

6. **Fallback protected**
   - If AI fails or returns empty output, the app automatically gives safe fallback reviews

7. **Gemini support added**
   - If `GEMINI_API_KEY` exists, Gemini is used first
   - If not, `OPENAI_API_KEY` is used
   - If both fail/missing, fallback reviews are used

## Important Environment Variables

Use either Gemini or OpenAI.

For Gemini:

```env
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=
```

For OpenAI:

```env
OPENAI_API_KEY=your_openai_key
```

## After replacing files

Run:

```cmd
npm install
npm run build
npm run dev
```

## Deploy to Vercel

Push to GitHub:

```cmd
git add .
git commit -m "safe business edit delete and review loading update"
git push
```

Then redeploy in Vercel.

Make sure Vercel has:

```env
DATABASE_URL=your_neon_url
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://review.beingbrief.in
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=
```
