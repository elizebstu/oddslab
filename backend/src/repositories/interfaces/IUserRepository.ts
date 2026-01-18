import type { User, Prisma } from '@prisma/client';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: Prisma.UserCreateInput): Promise<User>;
  update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
  delete(id: string): Promise<User>;
  existsByEmail(email: string): Promise<boolean>;
}

export type UserCreateInput = {
  email: string;
  password: string;
};

export type UserResponse = {
  id: string;
  email: string;
  createdAt: Date;
};
