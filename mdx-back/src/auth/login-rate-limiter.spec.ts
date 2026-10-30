import { HttpException } from '@nestjs/common';
import { LoginRateLimiter } from './login-rate-limiter.js';

describe('LoginRateLimiter', () => {
  it('bloqueia o e-mail depois de 5 senhas erradas e libera depois da janela', () => {
    let now = 0;
    const limiter = new LoginRateLimiter(() => now);
    const email = 'pessoa@example.com';

    for (let attempt = 0; attempt < 5; attempt += 1) {
      limiter.assertAllowed(email);
      limiter.recordFailure(email);
    }

    expect(() => limiter.assertAllowed(email)).toThrow(HttpException);
    try {
      limiter.assertAllowed(email);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(429);
    }

    now = 15 * 60 * 1000 + 1;
    expect(() => limiter.assertAllowed(email)).not.toThrow();
  });

  it('zera a contagem depois de um login certo', () => {
    const limiter = new LoginRateLimiter();
    const email = 'pessoa@example.com';

    for (let attempt = 0; attempt < 4; attempt += 1) {
      limiter.recordFailure(email);
    }

    limiter.recordSuccess(email);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      limiter.assertAllowed(email);
      limiter.recordFailure(email);
    }

    expect(() => limiter.assertAllowed(email)).toThrow(HttpException);
  });
});
