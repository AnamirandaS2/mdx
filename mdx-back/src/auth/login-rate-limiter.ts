import { HttpException, HttpStatus } from '@nestjs/common';

const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

export class LoginRateLimiter {
  private readonly attempts = new Map<string, number[]>();

  constructor(private readonly now: () => number = Date.now) {}

  assertAllowed(email: string): void {
    if (this.recent(email).length >= LIMIT) {
      throw new HttpException(
        'Muitas tentativas. Espere alguns minutos e tente de novo.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  recordFailure(email: string): void {
    const key = normalize(email);
    const recent = this.recent(key);
    recent.push(this.now());
    this.attempts.set(key, recent);
  }

  recordSuccess(email: string): void {
    this.attempts.delete(normalize(email));
  }

  private recent(email: string): number[] {
    const cutoff = this.now() - WINDOW_MS;
    return (this.attempts.get(normalize(email)) ?? []).filter(
      (time) => time > cutoff,
    );
  }
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}
