// ---------------------------------------------------------------------------
// DEMO MODE
//
// While the backend isn't deployed yet, the admin & staff dashboards run in a
// "preview" mode: no login required, and they show representative sample data
// so the client can click through the full flow. A small banner makes it clear
// this is a UI preview. Once the backend is live, these screens use real data
// (the login guard + real API calls already exist; demo data is only the
// fallback when the API can't be reached).
// ---------------------------------------------------------------------------

export const DEMO_MODE = false; // backend is now wired up — real login + live data

export const demoSummary = {
  bookings: { total: 1284, confirmed: 1102, checkedIn: 868 },
  accommodation: { confirmed: 214 },
  donations: { count: 437, totalAmount: 5_42_000_00 }, // paise
  revenue: { totalAmount: 18_73_500_00 }, // paise
};

export const demoPoojas = [
  { id: '1', name: 'Suprabhata Seva', basePrice: 10000, isSpecial: false, isActive: true },
  { id: '2', name: 'Archana', basePrice: 5000, isSpecial: false, isActive: true },
  { id: '3', name: 'Abhishekam', basePrice: 50000, isSpecial: true, isActive: true },
  { id: '4', name: 'Kalyanotsavam', basePrice: 100000, isSpecial: true, isActive: true },
];

export const demoNews = [
  { id: '1', title: 'Brahmotsavam Festival Dates Announced', publishedAt: '2026-06-20T09:00:00Z' },
  { id: '2', title: 'Online Pooja Booking Now Live', publishedAt: '2026-06-15T09:00:00Z' },
];

export const demoSlots = [
  { id: 's1', startTime: '2026-06-28T06:00:00Z', capacity: 50, booked: 32 },
  { id: 's2', startTime: '2026-06-28T09:00:00Z', capacity: 50, booked: 50 },
  { id: 's3', startTime: '2026-06-28T17:00:00Z', capacity: 50, booked: 11 },
];
