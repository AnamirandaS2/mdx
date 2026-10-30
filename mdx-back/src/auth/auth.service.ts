import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import type { AuthUser } from '../server/permissions.js';
import { LoginRateLimiter } from './login-rate-limiter.js';
import { TokenService } from './token.service.js';
import { UsersRepository } from './users.repository.js';

const HASH_ROUNDS = 12;

export type AuthSession = {
  token: string;
  user: AuthUser & { name: string; email: string };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly tokens: TokenService,
    private readonly limiter: LoginRateLimiter,
  ) {}

  async login(email: string, password: string): Promise<AuthSession> {
    const normalized = email.trim().toLowerCase();
    this.limiter.assertAllowed(normalized);
    const stored = await this.users.findByEmail(normalized);
    const passwordOk = stored
      ? await bcrypt.compare(password, stored.passwordHash)
      : false;

    if (!stored || !passwordOk) {
      this.limiter.recordFailure(normalized);
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    this.limiter.recordSuccess(normalized);
    return this.sessionFor(stored);
  }

  async register(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthSession> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException('Já existe uma conta com esse e-mail.');
    }

    const passwordHash = await bcrypt.hash(input.password, HASH_ROUNDS);
    try {
      const created = await this.users.create({
        name: input.name.trim(),
        email,
        passwordHash,
      });
      return this.sessionFor(created);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Já existe uma conta com esse e-mail.');
      }
      throw error;
    }
  }

  private async sessionFor(stored: {
    id: string;
    name: string;
    email: string;
    role: AuthUser['role'];
  }): Promise<AuthSession> {
    const user: AuthUser & { name: string; email: string } = {
      id: stored.id,
      name: stored.name,
      email: stored.email,
      role: stored.role,
      memberships: await this.users.memberships(stored.id),
    };
    return { token: await this.tokens.sign(user), user };
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  );
}
