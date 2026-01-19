import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { RegisterDto, LoginDto, AuthResponse } from '../types/dtos';
import { UnauthorizedError, ConflictError } from '../types/common';

export interface AuthServiceDependencies {
  userRepository: IUserRepository;
}

export class AuthService {
  constructor(private deps: AuthServiceDependencies) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const { email, password } = dto;

    const existingUser = await this.deps.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('This email is already registered. Please log in.');
    }

    const hashedPassword = await this.hashPassword(password);
    const user = await this.deps.userRepository.create({ email, password: hashedPassword });

    logger.info(`New user registered: ${user.id}`);

    this.sendMockVerificationEmail(email);

    const token = this.generateToken(user.id);

    return { token, user: { id: user.id, email: user.email } };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const { email, password } = dto;

    const user = await this.deps.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('User not found. Please check your email.');
    }

    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Incorrect password.');
    }

    logger.info(`User logged in: ${user.id}`);

    const token = this.generateToken(user.id);

    return { token, user: { id: user.id, email: user.email } };
  }

  verifyToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, config.JWT_SECRET) as { userId: string };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private generateToken(userId: string): string {
    return jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN } as jwt.SignOptions);
  }

  private sendMockVerificationEmail(email: string): void {
    logger.info(`[Mock Email] Verification email sent to: ${email}`);
  }
}
