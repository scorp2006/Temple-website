import { poojaRepository, PoojaRepository } from './pooja.repository';
import { ApiError } from '../../utils/ApiError';

interface CreatePoojaInput {
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
  isSpecial?: boolean;
}

interface BulkSlotInput {
  poojaId: string;
  startDate: string; // ISO date (yyyy-mm-dd)
  endDate: string; // ISO date inclusive
  dailyStartTime: string; // "06:00"
  dailyEndTime: string; // "18:00"
  slotDurationMinutes: number;
  capacity: number;
  price?: number; // defaults to pooja.basePrice
}

export class PoojaService {
  constructor(private readonly repo: PoojaRepository = poojaRepository) {}

  list(includeInactive = false) {
    return this.repo.list(includeInactive);
  }

  async get(id: string) {
    const pooja = await this.repo.findById(id);
    if (!pooja) throw ApiError.notFound('Pooja not found');
    return pooja;
  }

  create(input: CreatePoojaInput) {
    return this.repo.create({
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl,
      basePrice: input.basePrice,
      isSpecial: input.isSpecial ?? false,
    });
  }

  async update(id: string, input: Partial<CreatePoojaInput> & { isActive?: boolean }) {
    await this.get(id);
    return this.repo.update(id, input);
  }

  async listSlots(poojaId: string, fromDate?: Date) {
    await this.get(poojaId);
    return this.repo.listSlots(poojaId, fromDate);
  }

  async createSlot(input: {
    poojaId: string;
    startTime: string;
    endTime: string;
    capacity: number;
    price?: number;
  }) {
    const pooja = await this.get(input.poojaId);
    return this.repo.createSlot({
      poojaId: input.poojaId,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      capacity: input.capacity,
      price: input.price ?? pooja.basePrice,
    });
  }

  // Bulk slot generation (PRD: "generate slots in bulk for a date range").
  async bulkGenerateSlots(input: BulkSlotInput) {
    const pooja = await this.get(input.poojaId);
    const price = input.price ?? pooja.basePrice;

    const [startH, startM] = input.dailyStartTime.split(':').map(Number);
    const [endH, endM] = input.dailyEndTime.split(':').map(Number);
    if (
      Number.isNaN(startH) ||
      Number.isNaN(endH) ||
      input.slotDurationMinutes <= 0
    ) {
      throw ApiError.badRequest('Invalid time range or duration');
    }

    const start = new Date(input.startDate + 'T00:00:00');
    const end = new Date(input.endDate + 'T00:00:00');
    if (end < start) throw ApiError.badRequest('endDate must be on/after startDate');

    const slots: {
      poojaId: string;
      startTime: Date;
      endTime: Date;
      capacity: number;
      price: number;
    }[] = [];

    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      const dayStart = new Date(day);
      dayStart.setHours(startH, startM, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(endH, endM, 0, 0);

      for (
        let t = new Date(dayStart);
        t < dayEnd;
        t = new Date(t.getTime() + input.slotDurationMinutes * 60000)
      ) {
        const slotEnd = new Date(t.getTime() + input.slotDurationMinutes * 60000);
        if (slotEnd > dayEnd) break;
        slots.push({
          poojaId: input.poojaId,
          startTime: new Date(t),
          endTime: slotEnd,
          capacity: input.capacity,
          price,
        });
      }
    }

    if (slots.length === 0) {
      throw ApiError.badRequest('No slots generated - check your time range');
    }
    if (slots.length > 5000) {
      throw ApiError.badRequest(
        `Refusing to generate ${slots.length} slots at once (limit 5000). Narrow the range.`
      );
    }

    const result = await this.repo.createManySlots(slots);
    return { generated: result.count };
  }

  async updateSlot(
    id: string,
    input: { capacity?: number; price?: number; isOpen?: boolean }
  ) {
    const slot = await this.repo.findSlot(id);
    if (!slot) throw ApiError.notFound('Slot not found');
    if (input.capacity !== undefined && input.capacity < slot.booked) {
      throw ApiError.badRequest(
        `Capacity cannot be lower than already-booked count (${slot.booked})`
      );
    }
    return this.repo.updateSlot(id, input);
  }
}

export const poojaService = new PoojaService();
