import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // --- Users ---
  const admin = await prisma.user.upsert({
    where: { email: 'admin@temple.org' },
    update: {},
    create: { name: 'Temple Admin', email: 'admin@temple.org', passwordHash, role: Role.ADMIN },
  });
  await prisma.user.upsert({
    where: { email: 'staff@temple.org' },
    update: {},
    create: { name: 'Ground Staff', email: 'staff@temple.org', passwordHash, role: Role.STAFF },
  });

  // --- Poojas ---
  const poojas = [
    { name: 'Suprabhata Seva', description: 'Early morning awakening of the deity.', basePrice: 10000, isSpecial: false },
    { name: 'Archana', description: 'Offering of prayers with the devotee’s name and gotra.', basePrice: 5000, isSpecial: false },
    { name: 'Abhishekam', description: 'Sacred bathing ritual of the deity.', basePrice: 50000, isSpecial: true },
    { name: 'Kalyanotsavam', description: 'Celestial wedding ceremony of the deity.', basePrice: 100000, isSpecial: true },
  ];

  for (const p of poojas) {
    const existing = await prisma.pooja.findFirst({ where: { name: p.name } });
    const pooja = existing ?? (await prisma.pooja.create({ data: p }));

    // Create a few slots for the next 7 days if none exist.
    const slotCount = await prisma.slot.count({ where: { poojaId: pooja.id } });
    if (slotCount === 0) {
      const slots = [];
      for (let d = 1; d <= 7; d++) {
        for (const hour of [6, 9, 17]) {
          const start = new Date();
          start.setDate(start.getDate() + d);
          start.setHours(hour, 0, 0, 0);
          const end = new Date(start.getTime() + 30 * 60000);
          slots.push({
            poojaId: pooja.id,
            startTime: start,
            endTime: end,
            capacity: p.isSpecial ? 10 : 50,
            price: p.basePrice,
          });
        }
      }
      await prisma.slot.createMany({ data: slots });
    }
  }

  // --- Room types + rooms ---
  const roomTypes = [
    { name: 'AC Double Room', description: 'Comfortable AC room for two.', pricePerNight: 150000, capacity: 2, count: 5 },
    { name: 'Non-AC Room', description: 'Simple, clean room.', pricePerNight: 80000, capacity: 3, count: 5 },
    { name: 'Dormitory Bed', description: 'Shared dormitory accommodation.', pricePerNight: 20000, capacity: 1, count: 20 },
  ];
  for (const rt of roomTypes) {
    const existing = await prisma.roomType.findFirst({ where: { name: rt.name } });
    if (existing) continue;
    const type = await prisma.roomType.create({
      data: {
        name: rt.name,
        description: rt.description,
        pricePerNight: rt.pricePerNight,
        capacity: rt.capacity,
      },
    });
    await prisma.room.createMany({
      data: Array.from({ length: rt.count }, (_, i) => ({
        roomTypeId: type.id,
        number: `${rt.name.slice(0, 1)}-${String(i + 1).padStart(3, '0')}`,
      })),
    });
  }

  // --- News ---
  const newsCount = await prisma.news.count();
  if (newsCount === 0) {
    await prisma.news.createMany({
      data: [
        {
          title: 'Brahmotsavam Festival Dates Announced',
          body: 'The annual Brahmotsavam will be celebrated with grandeur. Devotees are invited to participate in the nine-day festivities.',
          authorId: admin.id,
        },
        {
          title: 'New Online Pooja Booking Now Live',
          body: 'Devotees can now book poojas and seva online and receive an e-ticket with a QR code for darshan.',
          authorId: admin.id,
        },
      ],
    });
  }

  // --- LiveStream ---
  const stream = await prisma.liveStream.findFirst();
  if (!stream) {
    await prisma.liveStream.create({
      data: {
        title: 'Live Darshan',
        embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
        isVisible: true,
      },
    });
  }

  console.log('Seed complete.');
  console.log('  Admin login: admin@temple.org / password123');
  console.log('  Staff login: staff@temple.org / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
