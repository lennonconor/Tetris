# Supabase Backend Setup (Global Leaderboard)

This project includes a Supabase backend scaffold for the global leaderboard:

- SQL migration: `supabase/migrations/20260309_leaderboard.sql`
- Edge function: `supabase/functions/leaderboard/index.ts`

## 1. Prerequisites

- Supabase project created
- Supabase CLI installed and authenticated

## 2. Link CLI to your project

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

## 3. Apply database migration

```bash
supabase db push
```

This creates:

- `public.leaderboard_entries`
- `public.leaderboard_rate_limits`
- required indexes + RLS policy for public reads

## 4. Set edge function secrets

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
supabase secrets set ALLOWED_ORIGIN=https://lennonconor.github.io
```

`SUPABASE_URL` is available automatically in Supabase Edge Functions.

## 5. Deploy the edge function

```bash
supabase functions deploy leaderboard
```

## 6. Verify API

Replace `<project-ref>` with your Supabase project ref:

```bash
curl "https://<project-ref>.functions.supabase.co/leaderboard?limit=10" \
  -H "Origin: https://lennonconor.github.io"
```

## 7. Configure frontend

Before loading `script.js`, set:

```html
<script>
  window.TETRIS_API_BASE_URL = "https://<project-ref>.functions.supabase.co";
</script>
<script src="script.js"></script>
```

The frontend will call:

- `GET /leaderboard?limit=10`
- `POST /leaderboard` with `{ "name": "...", "score": 123 }`

## Notes

- The edge function validates and normalizes input.
- CORS is restricted to `ALLOWED_ORIGIN`.
- A basic IP+User-Agent hash rate limit is enforced (`12` score posts per minute).
