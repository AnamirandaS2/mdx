import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  let controller: HealthController;
  const check = vi.fn();
  const pingCheck = vi.fn();

  beforeEach(async () => {
    check.mockReset();
    pingCheck.mockReset();
    check.mockResolvedValue({ status: 'ok' });
    pingCheck.mockReturnValue({
      withTimeout: () => ({ database: { status: 'up' } }),
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: { check } },
        { provide: TypeOrmHealthIndicator, useValue: { pingCheck } },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('consulta o Postgres', async () => {
    await controller.check();

    expect(check).toHaveBeenCalledOnce();

    const indicators = check.mock.calls[0]?.[0] as Array<() => unknown>;
    indicators[0]?.();

    expect(pingCheck).toHaveBeenCalledWith('database');
  });
});
