import { PrismaClient } from '@prisma/client';
import type { IUserRepository, UserResponse } from './interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: { email: string; password: string }) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: { email?: string; password?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    return user !== null;
  }

  toResponse(user: { id: string; email: string }): UserResponse {
    return { id: user.id, email: user.email };
  }
}
