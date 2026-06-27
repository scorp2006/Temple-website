# Deployment Guide — Sri Jagajjanani Temple

Three pieces:

| Piece | Host | What |
| ----- | ---- | ---- |
| Database | **Render** | PostgreSQL (free) |
| Backend | **Render** | Express API (free web service) |
| Frontend | **Vercel** | Next.js site |

You'll push this repo to GitHub, then deploy. Total time ~15 min.

---

## 0. Push to GitHub

From the project root:

```bash
git init
git add .
git commit -m "Sri Jagajjanani Temple platform"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

> `.env` files are git-ignored — secrets won't be pushed. Good.

---

## 1. Backend + Database on Render (Blueprint — one click)

This repo has a [`render.yaml`](render.yaml) blueprint that creates **both** the
Postgres database and the Express service automatically.

1. Go to **https://dashboard.render.com** → **New** → **Blueprint**.
2. Connect your GitHub repo. Render reads `render.yaml` and shows: `temple-db`
   (Postgres) + `temple-api` (web service).
3. Click **Apply**. Render will:
   - create the Postgres DB,
   - build the backend (`npm install → prisma generate → build → migrate deploy → seed`),
   - start it, and health-check `/api/health`.
4. When it's live, copy the backend URL, e.g. `https://temple-api.onrender.com`.

> The build **auto-seeds** demo data + test accounts (see credentials below).
> Free Postgres on Render expires after 90 days — upgrade the DB plan for a
> permanent production database.

### After the frontend is deployed, set CORS
In Render → `temple-api` → **Environment**, set `CORS_ORIGINS` to your Vercel URL
(e.g. `https://temple.vercel.app`) and save (it redeploys).

---

## 2. Frontend on Vercel

1. Go to **https://vercel.com** → **Add New** → **Project** → import the repo.
2. **Root Directory:** set to `frontend`.
3. **Environment Variables:** add
   `NEXT_PUBLIC_API_URL = https://temple-api.onrender.com/api`
   (your Render backend URL + `/api`).
4. Deploy. Vercel gives you a URL like `https://temple.vercel.app`.
5. Go back to step 1's "set CORS" and put this URL in the backend.

---

## 3. Test credentials (seeded automatically)

| Role | Email | Password |
| ---- | ----- | -------- |
| **Admin** | `admin@temple.org` | `password123` |
| **Volunteer / Staff** | `staff@temple.org` | `password123` |

- Sign in from the top bar → **Sign In / Sign Up**.
- Admin lands on the **Admin Dashboard**; Volunteer lands on the **Volunteer Portal**.
- Devotees can browse + book without an account (guest booking).

---

## 4. Verify the live site

1. Open the Vercel URL → homepage loads with poojas/news (live from the API).
2. **Book a pooja:** select pooja → slot → details → pay (mock) → e-ticket with QR.
3. **Admin:** log in as admin → see dashboards, manage poojas/slots/news/livestream.
4. **Volunteer:** log in as staff → scan a ticket QR / create a spot booking.

---

## Notes

- **Payments** run in mock mode (`PAYMENTS_MODE=mock`) — no real charges. To go
  live, set `PAYMENTS_MODE=razorpay` + add `RAZORPAY_KEY_ID`/`SECRET` in Render.
- **Booking queue:** the adaptive overflow queue is on by default
  (`QUEUE_MAX_CONCURRENT=50`). Under normal load it's invisible; under a surge it
  forms a fair waiting line. Tune via env vars. Status: `GET /api/bookings/queue-status`.
- **API docs:** once the backend is live, open `https://temple-api.onrender.com/api/docs`.
- Render free web services **sleep after inactivity** — the first request after
  idle takes ~30s to wake. Fine for demos; upgrade the plan to keep it always-on.
