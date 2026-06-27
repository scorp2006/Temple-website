import { User } from '@prisma/client';
import { Role } from '../../constants/enums';
import { authRepository, AuthRepository } from './auth.repository';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import { ApiError } from '../../utils/ApiError';

interface RegisterInput {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}

interface LoginInput {
  email?: string;
  phone?: string;
  password: string;
}

// Strip the password hash before returning a user to the client.
function toPublicUser(user: User) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  async register(input: RegisterInput) {
    if (!input.email && !input.phone) {
      throw ApiError.badRequest('Provide an email or phone number');
    }
    if (input.email && (await this.repo.findByEmail(input.email))) {
      throw ApiError.conflict('Email already registered');
    }
    if (input.phone && (await this.repo.findByPhone(input.phone))) {
      throw ApiError.conflict('Phone already registered');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.repo.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: Role.VISITOR, // self-registration always creates a visitor
    });

    const token = signToken({ userId: user.id, role: user.role as Role });
    return { token, user: toPublicUser(user) };
  }

  async login(input: LoginInput) {
    const user = input.email
      ? await this.repo.findByEmail(input.email)
      : input.phone
        ? await this.repo.findByPhone(input.phone)
        : null;

    if (!user || !user.passwordHash) {
      throw ApiError.unauthorized('Invalid credentials');
    }
    const ok = await comparePassword(input.password, user.passwordHash);
    if (!ok) throw ApiError.unauthorized('Invalid credentials');

    const token = signToken({ userId: user.id, role: user.role as Role });
    return { token, user: toPublicUser(user) };
  }

  async me(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return toPublicUser(user);
  }

  // --- Admin-only staff management ---

  async listStaff() {
    const staff = await this.repo.listByRole(Role.STAFF);
    return staff.map(toPublicUser);
  }

  async createStaff(input: RegisterInput) {
    if (!input.email && !input.phone) {
      throw ApiError.badRequest('Provide an email or phone number');
    }
    if (input.email && (await this.repo.findByEmail(input.email))) {
      throw ApiError.conflict('Email already registered');
    }
    const passwordHash = await hashPassword(input.password);
    const user = await this.repo.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
      role: Role.STAFF,
    });
    return toPublicUser(user);
  }

  async setRole(userId: string, role: Role) {
    const user = await this.repo.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    const updated = await this.repo.updateRole(userId, role);
    return toPublicUser(updated);
  }
}

export const authService = new AuthService();
