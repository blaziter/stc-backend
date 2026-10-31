import type { PoolConfig } from 'pg';
import { registerAs } from '@nestjs/config';

export interface PostgresConfig extends PoolConfig {
  host: string;
  database: string;
  port: number;
  user: string;
  password: string;
  max: number;
  min: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  statement_timeout: number;
  keepAlive: boolean;
  ssl?: boolean | { rejectUnauthorized: boolean; ca?: string };
}

export default registerAs('stc-api-postgres', (): PostgresConfig => {
  const host = (process.env.PG_HOST ?? 'localhost') as string;
  const isAzure = host.includes('azure.com');

  const sslConfig: PostgresConfig['ssl'] = (() => {
    if (process.env.PG_SSL === 'false') {
      return undefined;
    }
    if (process.env.PG_SSL === 'true' || isAzure) {
      return {
        rejectUnauthorized:
          process.env.PG_SSL_REJECT_UNAUTHORIZED === 'true' || process.env.NODE_ENV === 'production',
        ca: process.env.PG_SSL_CA,
      };
    }
    return undefined;
  })();

  const config = {
    host,
    database: (process.env.PG_DATABASE ?? 'postgres') as string,
    port: parseInt((process.env.PG_PORT ?? '5432') as string, 10),
    user: (process.env.PG_USER || process.env.PG_CONTROL_USER || 'stc_admin') as string,
    password: (process.env.PG_PASSWORD || process.env.PG_CONTROL_PASSWORD || '') as string,
    max: parseInt((process.env.PG_POOL_MAX ?? '20') as string, 10),
    min: parseInt((process.env.PG_POOL_MIN ?? '2') as string, 10),
    idleTimeoutMillis: parseInt((process.env.PG_IDLE_TIMEOUT ?? '10000') as string, 10),
    connectionTimeoutMillis: parseInt((process.env.PG_CONNECTION_TIMEOUT ?? '3000') as string, 10),
    statement_timeout: parseInt((process.env.PG_STATEMENT_TIMEOUT ?? '5000') as string, 10),
    keepAlive: true,
    ssl: sslConfig,
  } satisfies PostgresConfig;

  return config;
});
