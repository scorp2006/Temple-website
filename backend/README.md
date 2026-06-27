# Temple Backend API

Express + TypeScript + Prisma REST API for the Sri Jagajjanani Temple platform.
Follows a **service + repository** pattern (OOP), per the PRD.

## Folder structure

```
src/
├── config/        env loading, shared Prisma client
├── constants/     app enums (Role, BookingStatus, ... — stored as strings, see note)
├── middleware/    auth (JWT + RBAC), validation (Zod), rate limiting, error handler
├── modules/       one folder per feature: repository → service → controller → routes
│   ├── auth/          register, login, /me, staff management
│   ├── pooja/         poojas, slots, bulk slot generation
│   ├── booking/       reserve → confirm, spot booking, QR scan/check-in
│   ├── accommodation/ room types, availability, room booking
│   ├── donation/      donations + donor card token
│   ├── payment/       shared payment service (mock / Razorpay)
│   ├── content/       news, events, livestream
│   └── dashboard/     admin summary stats
├── jobs/          auto-release of expired slot/room holds (scheduled)
├── utils/         JWT, password hashing, QR, ApiError, asyncHandler
├── app.ts         Express app wiring
└── server.ts      entry point
```

## Prerequisites

- Node 18+ (you have v23)
- A **PostgreSQL** database — local, or a cloud one (Render/Neon/Aiven/Supabase)

## Database

Set `DATABASE_URL` in `.env` to your Postgres connection string:

```
# local
DATABASE_URL="postgresql://postgres:<password>@localhost:5432/temple?schema=public"
# cloud (usually needs SSL)
DATABASE_URL="postgresql://user:pass@host:5432/temple?sslmode=require"
```

> For deployment, the [`render.yaml`](../render.yaml) blueprint provisions a free
> Postgres on Render and wires `DATABASE_URL` automatically — see
> [DEPLOY.md](../DEPLOY.md).

## Setup

```bash
npm install
cp .env.example .env            # edit DATABASE_URL, JWT_SECRET
npx prisma generate             # generate the typed client
npx prisma migrate dev --name init   # create tables (needs Postgres reachable)
npm run seed                    # demo data + admin/staff accounts
npm run dev                     # http://localhost:4000
```

### Seeded demo accounts

| Role  | Email             | Password    |
| ----- | ----------------- | ----------- |
| Admin | admin@temple.org  | password123 |
| Staff | staff@temple.org  | password123 |

## Key design notes

### Concurrency-safe booking (no overselling)

`booking.service.ts` reserves seats inside a DB transaction using an **atomic
conditional update**:

```ts
const updated = await tx.slot.updateMany({
  where: { id, booked: { lte: capacity - seats } },  // condition lives in the write
  data:  { booked: { increment: seats } },
});
if (updated.count === 0) throw conflict('Not enough seats');  // slot full
```

Two simultaneous requests for the last seat can never both succeed — the database
serialises the update. Seats are **held** for `RESERVATION_HOLD_MINUTES` while the
devotee pays, then auto-released by the `jobs/releaseExpiredHolds` background job
if payment doesn't complete. **Idempotency keys** prevent double-taps creating
duplicate bookings. **Rate limiting** protects sensitive endpoints.

### Payments

`PAYMENTS_MODE=mock` (default) uses a fake gateway that always succeeds — the full
reserve → pay → confirm flow works with no keys. Set `PAYMENTS_MODE=razorpay` and
add keys, then implement the two stubbed methods in `payment.service.ts`.

### Enums

Enum-like columns (`role`, `status`, etc.) are stored as `String`, with the
allowed values defined and enforced in `src/constants/enums.ts`. (This was
originally done for SQL Server, which lacks enum support; kept as-is on Postgres
to avoid churn. Could be migrated to native Prisma enums later if desired.)

## Interactive API docs (Swagger)

Once the server is running, open:

- **Swagger UI:** http://localhost:4000/api/docs
- **Raw OpenAPI JSON:** http://localhost:4000/api/docs.json

The spec lives in `src/docs/openapi.ts` and documents every endpoint, request
body, and auth requirement. Click **Authorize** in Swagger UI and paste a JWT
(from `/auth/login`) to try admin/staff endpoints.

## API overview

| Method | Path                                | Access  |
| ------ | ----------------------------------- | ------- |
| POST   | `/api/auth/register` `/login`       | public  |
| GET    | `/api/auth/me`                      | auth    |
| GET    | `/api/poojas` `/poojas/:id/slots`   | public  |
| POST   | `/api/poojas` `/poojas/slots/bulk`  | admin   |
| POST   | `/api/bookings/reserve` `/:id/confirm` | public (guest ok) |
| POST   | `/api/bookings/spot` `/scan`        | staff/admin |
| GET    | `/api/bookings`                     | admin   |
| *      | `/api/accommodation/*`              | mixed   |
| POST   | `/api/donations` `/:id/confirm`     | public  |
| *      | `/api/news` `/events` `/livestream` | mixed   |
| GET    | `/api/dashboard/summary`            | admin   |

## Deploy

The repo's [`render.yaml`](../render.yaml) blueprint provisions Postgres + this
API on Render in one click, auto-runs migrations, and seeds test data. Full
step-by-step (backend on Render, frontend on Vercel) is in
[DEPLOY.md](../DEPLOY.md).
