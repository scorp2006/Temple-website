import { Prisma, User } from '@prisma/client';
import { Role } from '../../constants/enums';
import { prisma } from '../../config/prisma';

// Repository: the only place that talks to the DB for users.
// Services depend on this, not on Prisma directly (repository pattern, per PRD).
export class AuthRepository {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { phone } });
  }

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  listByRole(role: Role): Promise<User[]> {
    return prisma.user.findMany({ where: { role }, orderBy: { createdAt: 'desc' } });
  }

  updateRole(id: string, role: Role): Promise<User> {
    return prisma.user.update({ where: { id }, data: { role } });
  }
}

export const authRepository = new AuthRepository();
