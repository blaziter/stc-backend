import { Pool, PoolClient, QueryConfig, QueryResult, QueryResultRow, types } from 'pg';
import { Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { PostgresConfig } from '@config/postgres.config.js';

import { PostgresClient } from './postgres.client.js';
import { DatabaseError, TransactionError } from './postgres.error.js';

export type IsolationLevel = 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';

export interface PoolStats {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
}

@Injectable()
export class PostgresService extends PostgresClient implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(PostgresService.name);
  protected readonly pool: Pool;
  private readonly statementTimeoutMs: number;

  public constructor(configService: ConfigService) {
    super();
    const config = configService.getOrThrow<PostgresConfig>('stc-api-postgres');
    this.statementTimeoutMs = config.statement_timeout ?? 5000;
    this.pool = new Pool(config);

    this.pool.on('error', (err: Error): void => {
      this.logger.error(`Unexpected error on idle PostgreSQL client: ${err.message}`, err.stack);
    });
  }

  public onModuleInit(): void {
    /**
     * 20 = bigint = int8
     * JS Number is safe up to 2^53 ~ 10^16
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger
     */
    types.setTypeParser(types.builtins.INT8, (val: string): number | string => {
      const num = parseInt(val, 10);
      return Number.isSafeInteger(num) ? num : val;
    });

    /**
     * 1082 = date - keep date without time as string to avoid timezone issues
     */
    types.setTypeParser(types.builtins.DATE, (val: string): string => val);

    /**
     * 1700 = numeric - keep numeric as string to avoid IEEE 754 precision loss
     */
    types.setTypeParser(types.builtins.NUMERIC, (val: string): string => val);
  }

  public async onApplicationShutdown(): Promise<void> {
    this.logger.log('Terminating PostgreSQL connection pool...');
    await this.shutdown();
  }

  public async shutdown(): Promise<void> {
    await this.pool.end();
  }

  protected override async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  protected override async cleanupClient(client: PoolClient): Promise<void> {
    client.release();
  }

  public async query<
    R extends QueryResultRow = QueryResultRow,
    I extends readonly unknown[] = readonly unknown[],
  >(queryConfig: QueryConfig<I>): Promise<QueryResult<R>> {
    const startTime = performance.now();
    try {
      const result = await this.pool.query<R, I>(queryConfig);
      const durationMs = Math.round(performance.now() - startTime);

      if (durationMs > 5000) {
        this.logger.warn(`Slow query detected (${durationMs}ms): ${queryConfig.text}`);
      }

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown database error';
      this.logger.error(`Database query failed: ${message} | Query: ${queryConfig.text}`);
      throw new DatabaseError(message, queryConfig.text, queryConfig.values);
    }
  }

  protected override async execute<
    R extends QueryResultRow,
    I extends readonly unknown[] = readonly unknown[],
  >(queryConfig: QueryConfig<I>): Promise<QueryResult<R>> {
    return await this.query<R, I>(queryConfig);
  }

  public async queryRows<
    R extends QueryResultRow = QueryResultRow,
    I extends readonly unknown[] = readonly unknown[],
  >(queryConfig: QueryConfig<I>): Promise<R[]> {
    const result = await this.query<R, I>(queryConfig);
    return result.rows;
  }

  public async queryOne<
    R extends QueryResultRow = QueryResultRow,
    I extends readonly unknown[] = readonly unknown[],
  >(queryConfig: QueryConfig<I>): Promise<R | null> {
    const result = await this.query<R, I>(queryConfig);
    return result.rows[0] ?? null;
  }

  public async transaction<T>(
    operation: (client: PoolClient) => Promise<T>,
    isolationLevel: IsolationLevel = 'READ COMMITTED'
  ): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query(`BEGIN TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
      await client.query(`SET LOCAL statement_timeout = ${this.statementTimeoutMs}`);

      const result = await operation(client);

      await client.query('COMMIT');
      return result;
    } catch (error: unknown) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError: unknown) {
        this.logger.error(
          `Transaction rollback failed: ${rollbackError instanceof Error ? rollbackError.message : String(rollbackError)}`
        );
      }
      throw new TransactionError(
        error instanceof Error ? error.message : 'Transaction execution failed',
        error
      );
    } finally {
      await this.cleanupClient(client);
    }
  }

  public async isHealthy(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error: unknown) {
      this.logger.error(
        `Healthcheck probe failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }

  public getPoolStats(): PoolStats {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}
