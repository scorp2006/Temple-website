import { Prisma, Pooja, Slot } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class PoojaRepository {
  list(includeInactive = false): Promise<Pooja[]> {
    return prisma.pooja.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [{ isSpecial: 'asc' }, { name: 'asc' }],
    });
  }

  findById(id: string): Promise<Pooja | null> {
    return prisma.pooja.findUnique({ where: { id } });
  }

  create(data: Prisma.PoojaCreateInput): Promise<Pooja> {
    return prisma.pooja.create({ data });
  }

  update(id: string, data: Prisma.PoojaUpdateInput): Promise<Pooja> {
    return prisma.pooja.update({ where: { id }, data });
  }

  // --- Slots ---

  listSlots(poojaId: string, fromDate?: Date): Promise<Slot[]> {
    return prisma.slot.findMany({
      where: {
        poojaId,
        isOpen: true,
        ...(fromDate ? { startTime: { gte: fromDate } } : {}),
      },
      orderBy: { startTime: 'asc' },
    });
  }

  findSlot(id: string): Promise<Slot | null> {
    return prisma.slot.findUnique({ where: { id } });
  }

  createSlot(data: Prisma.SlotUncheckedCreateInput): Promise<Slot> {
    return prisma.slot.create({ data });
  }

  createManySlots(data: Prisma.SlotCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return prisma.slot.createMany({ data });
  }

  updateSlot(id: string, data: Prisma.SlotUpdateInput): Promise<Slot> {
    return prisma.slot.update({ where: { id }, data });
  }
}

export const poojaRepository = new PoojaRepository();
