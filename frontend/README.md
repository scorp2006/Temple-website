# Temple Frontend

Next.js (App Router) + TypeScript + Tailwind CSS site for the Sri Jagajjanani
Temple platform. Mobile-first, themed in maroon + kumkum + pasupu, with a
language switcher (EN / Telugu / Hindi).

## Folder structure

```
src/
├── app/
│   ├── layout.tsx        root layout (header, footer, i18n provider)
│   ├── page.tsx          home (hero, quick links, about, timings)
│   ├── about/            temple history, deity, timings, map
│   ├── poojas/           pooja list + [id] booking flow (slot → details → pay → e-ticket)
│   ├── accommodation/    room types → dates → book
│   ├── donate/           donation form → donor card
│   ├── news/             announcements feed
│   ├── live/             live darshan (lazy-loaded YouTube embed)
│   ├── login/            staff/admin login
│   ├── admin/            admin dashboard (overview, poojas, news, livestream)
│   └── staff/            staff portal (QR scan + spot booking)
├── components/   Header, Footer, SectionHeading
└── lib/          api client, i18n, formatting helpers
```

## Setup

```bash
npm install
npm run dev          # http://localhost:3000
```

Configure the backend URL in `.env.local`:

```
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

The site renders fully without the backend running — pages that fetch data show a
friendly "backend offline" state until the API is up.

## Theme

Defined in `tailwind.config.ts`:

- **maroon** (primary), **kumkum** (vermillion accent), **pasupu** (turmeric accent)
- Reusable component classes in `globals.css`: `.btn-primary`, `.card`, `.input`,
  `.section`, plus a `.temple-divider` motif.

Large tap targets (`min-h-[48px]`) and high contrast are used throughout for
accessibility (elderly devotees), per the PRD.

## Performance (PRD: fast on low-bandwidth mobile)

- Images use `loading="lazy"`; the heavy live-stream iframe only mounts after the
  user taps play.
- Demo images come from Unsplash; in production swap to Cloudinary/S3 URLs
  (already allowed in `next.config.mjs` remotePatterns) for automatic optimization.

## i18n

`src/lib/i18n.tsx` is a lightweight dictionary-based provider with a persisted
language switcher (EN / Telugu / Hindi). The PRD calls for next-intl in the final
build — this scaffold has the same shape and can be swapped to next-intl later.

## Deploy (Vercel)

Push `frontend/` to a repo, import into Vercel, set `NEXT_PUBLIC_API_URL` to your
deployed backend URL. Vercel handles the CDN, caching, and image optimization.

## Demo logins (after backend seeding)

- Admin: `admin@temple.org` / `password123`
- Staff: `staff@temple.org` / `password123`
