import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckResult, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus';

import { PostgresService } from '@services/postgres';

@Controller('health')
export class HealthController {
  public constructor(
    private readonly health: HealthCheckService,
    private readonly postgresService: PostgresService
  ) {}

  @Get()
  @HealthCheck()
  public async check(): Promise<HealthCheckResult> {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => {
        const isDbHealthy = await this.postgresService.isHealthy();
        if (!isDbHealthy) {
          throw new Error('PostgreSQL ping failed');
        }
        return {
          database: {
            status: 'up',
          },
        };
      },
    ]);
  }
}
