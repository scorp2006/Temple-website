# Sri Jagajjanani Temple — Digital Platform

A full digital platform for Sri Jagajjanani Temple: a mobile-first public website
(temple info, news, multilingual), devotee services (pooja slot booking,
accommodation, donations + donor cards), live darshan streaming, and an
admin/staff portal (event management, role-based access, QR ticket scanning,
walk-in spot booking).

This repository is split into **two independently deployable apps**, as required
by the PRD:

```
Temple website/
├── frontend/   → Next.js (App Router) site  — deploy to Vercel
└── backend/    → Express + Prisma REST API   — deploy to Render / a Node host
```

> Built solo, phased so the public site can ship early and booking / payment /
> admin complexity is layered on top.

---

## Tech stack

| Layer        | Choice                                                            |
| ------------ | ---------------------------------------------------------------- |
| Frontend     | Next.js (App Router), TypeScript, Tailwind CSS, Lucide icons     |
| Backend      | Express.js + TypeScript, REST, **service + repository** pattern  |
| Database     | PostgreSQL + Prisma ORM (PRD said SQL Server; moved to Postgres for hostability) |
| Auth         | JWT, role-based access (Admin / Staff / Visitor)                 |
| Payments     | Razorpay — **mock mode** by default (swap in real keys later)    |
| i18n         | English / Telugu / Hindi (lightweight scaffold; next-intl-ready) |
| QR codes     | `qrcode` (generation) + html5-qrcode (scanning, frontend)       |

---

## Quick start (local)

### 1. Backend

See **[backend/README.md](backend/README.md)** for full details. In short:

```bash
cd backend
npm install
cp .env.example .env          # then set DATABASE_URL (Postgres)
npx prisma migrate dev        # creates tables (needs Postgres reachable)
npm run seed                  # demo poojas, rooms, news, admin/staff users
npm run dev                   # → http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                   # → http://localhost:3000
```

The frontend reads the API base URL from `frontend/.env.local`
(`NEXT_PUBLIC_API_URL`, default `http://localhost:4000/api`).

---

## Current status

- ✅ **Backend**: full schema (13 tables), auth + RBAC, concurrency-safe pooja
  booking (reserve → pay → confirm with auto-release), accommodation, donations,
  news, events, livestream, admin dashboard stats, mock payments, Swagger docs.
- ✅ **Adaptive booking queue**: row-lock guarantees no overselling; an in-memory
  overflow queue engages only under surge load (configurable). Status endpoint at
  `/api/bookings/queue-status`.
- ✅ **Frontend**: all public pages + booking flow, login, admin dashboard,
  volunteer portal. Themed to the Figma design, mobile-first, multilingual.
- ✅ **PostgreSQL** + deploy-ready: [`render.yaml`](render.yaml) blueprint
  (Postgres + backend) and Vercel for the frontend. See [DEPLOY.md](DEPLOY.md).
- 🔑 **Test accounts** (seeded): admin@temple.org / staff@temple.org — both
  `password123`.

## Decisions confirmed with the client

1. **Database** — moved from SQL Server (PRD) to **PostgreSQL**, since no
   affordable cloud host offers SQL Server. Prisma made this a one-line swap.
2. **Image storage** — PRD mentions both AWS S3 (media storage) and Cloudinary
   (image optimization). Pick one primary; they overlap.
3. **Languages** — currently EN / Telugu / Hindi scaffolded; confirm the exact set.
4. **Razorpay** — needs a registered business + API keys; mock mode is wired in
   the meantime.

See each app's README for deployment notes.
