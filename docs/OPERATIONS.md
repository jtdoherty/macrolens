# MacroLens Operations Runbook

Day-to-day monitoring guide. Written so anyone can follow it — no coding required.

**Live site:** https://macrolens-six.vercel.app/

## What's where (the four dashboards you'll use)

| Service | What it does | Where to log in |
|---|---|---|
| **Vercel** | Hosts the website and runs the daily refresh job | https://vercel.com/ |
| **Clerk** | Manages user accounts (sign-up, sign-in, sessions) | https://dashboard.clerk.com/ |
| **Stripe** | Handles payments + subscriptions | https://dashboard.stripe.com/ |
| **Neon** | The Postgres database (stores subscriptions + forecast data) | https://console.neon.tech/ |

Bookmark all four.

## The 30-second daily health check

1. Open https://macrolens-six.vercel.app/ — does the dashboard load?
2. Open Vercel → Deployments — is the latest deployment status "Ready" (green)?
3. Open Vercel → Logs — any red error rows in the last 24 hours?

If all three are clean, you're done.

## How the pieces connect (plain English)

```
        ┌──────────────┐
        │   Visitor    │  (browser)
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │    Vercel    │  serves the Next.js website
        └──┬───────┬───┘
           │       │
   reads   │       │   reads users + subscription status
  forecasts│       │
           ▼       ▼
        ┌─────┐ ┌──────┐
        │Neon │ │Clerk │
        └──▲──┘ └──▲───┘
           │       │
           │       │ webhook event after every payment
           │       │
        ┌──┴───────┴──┐
        │   Stripe    │  charges cards, sends events
        └─────────────┘

        Once per day at 10:00 UTC, Vercel hits its own
        /api/refresh URL, which writes fresh forecast
        numbers into Neon.
```

In words:
- A visitor lands on Vercel. The site asks Clerk "is this person signed in?"
- If yes, it asks Neon (or Clerk as a fast backup) "do they have an active subscription?"
- If yes, the dashboard pages query Neon for the latest forecast data.
- When someone subscribes through Stripe, Stripe pings a webhook on Vercel, which writes the new subscription into Neon and Clerk.
- Once a day at 10:00 AM UTC (about 5–6 AM ET), Vercel runs `/api/refresh`, which scrambles the forecast numbers a tiny bit and writes them back into Neon. (When the Python forecast service is ready in Phase 4, this is what'll pull real data instead.)

## Common questions

### "How many users do we have?"
**Clerk Dashboard → Users.** Total user count is on the page header. You can also export to CSV.

### "How many paying subscribers do we have?"
Two ways to check, and they should match:
- **Stripe Dashboard → Customers** — anyone with status "active" or "trialing"
- **Neon → SQL Editor** — paste this:
  ```sql
  SELECT status, COUNT(*) FROM subscriptions GROUP BY status;
  ```

If they don't match, something went wrong with a webhook. See "When something breaks" below.

### "How much revenue did we make this month?"
**Stripe Dashboard → Home** — shows MRR (monthly recurring revenue) and recent payments.

### "Did the daily refresh run?"
**Vercel → Logs → filter by path `/api/refresh`.** You should see one entry per day around 10:00 UTC with status 200. Or check Neon directly:
```sql
SELECT MAX(updated_at) FROM forecasts;
```
That should be within the last 24 hours.

### "Is the site live and healthy right now?"
**Vercel → Deployments.** The most recent one should say "Ready". Click into it to see build logs if needed. Errors in runtime show up under **Logs**.

### "Someone says they paid but can't get in"
1. Find them in Clerk by email. Note their user ID.
2. Search Neon: `SELECT * FROM subscriptions WHERE user_id = 'user_XXX';` — is there a row with status `active` or `trialing`?
3. Search Stripe → Customers by their email — did the payment go through?
4. If Stripe says paid but Neon doesn't have a row, the webhook didn't fire correctly. Go to **Stripe Dashboard → Developers → Webhooks → Events** and look for failed deliveries. You can resend the event with one click.

## When something breaks

### The website returns 500 errors
- **Vercel → Logs** — read the most recent error
- Most common cause: missing or wrong environment variable. Check **Vercel → Settings → Environment Variables**.
- Second most common: Neon database paused (free tier auto-pauses after inactivity). Open Neon Console and the database wakes up automatically.

### The Vercel deploy fails after a code push
- **Vercel → Deployments → click the failed one → View Build Logs**
- Most failures are TypeScript or lint errors. The error message names a file and line number.

### A Stripe webhook event fails
- **Stripe Dashboard → Developers → Webhooks → click the endpoint pointing to macrolens-six.vercel.app**
- Scroll to "Recent events" — failed ones show 4xx/5xx status codes
- Click any event → "Resend" to retry it
- If they keep failing, the issue is in the webhook code, not the data — check Vercel logs for `/api/stripe/webhook` errors

### Neon is slow or unreachable
- **Neon Console → Project → look for incidents banner**
- Free tier pauses after ~5 min of inactivity; first request after pause takes ~10 seconds to wake up
- If you upgrade Neon, paused-by-default goes away

## Things you should NOT do
- Don't delete rows from `subscriptions` in Neon to "give someone a refund" — issue the refund in Stripe instead, the webhook handles the rest.
- Don't manually edit environment variables in Vercel unless you've also updated the matching local `.env.local` file — config drift is the #1 source of weird bugs.
- Don't delete users from Clerk on a hunch — Stripe still has their subscription. Cancel the subscription in Stripe first, then remove from Clerk if you must.
- Don't push directly to `main` without testing locally — Vercel auto-deploys on every push and there's no undo button (well, there's "Rollback" in Deployments, but it's a panic move).

## Useful queries to keep handy

Paste these into **Neon Console → SQL Editor** any time:

```sql
-- All active subscribers
SELECT user_id, status, current_period_end FROM subscriptions
WHERE status IN ('active', 'trialing')
ORDER BY updated_at DESC;

-- How fresh is forecast data?
SELECT ticker, updated_at FROM forecasts ORDER BY updated_at DESC LIMIT 5;

-- Count subscribers by status
SELECT status, COUNT(*) FROM subscriptions GROUP BY status;

-- Anyone with a failing payment?
SELECT user_id, status FROM subscriptions
WHERE status IN ('past_due', 'unpaid', 'incomplete');
```

## Escalation

If you can't figure out what's wrong:
1. Take screenshots of the Vercel logs and the relevant dashboard (Stripe / Clerk / Neon)
2. Note exactly when the problem started and what the user (or you) was doing
3. Send to Justin
