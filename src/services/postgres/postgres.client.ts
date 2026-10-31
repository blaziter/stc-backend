import type { ClientBase, QueryConfig, QueryResult, QueryResultRow } from 'pg';

import { DatabaseError, NotFoundError } from './postgres.error.js';

export abstract class PostgresClient {
  /**
   * Executes a SQL call, returns a single object.
   * @param queryConfig SQL call to execute
   * @throws {NotFoundError} when database does not return anything
   */
  public async callSingle<R extends QueryResultRow, I extends readonly unknown[] = readonly unknown[]>(
    queryConfig: QueryConfig<I>
  ): Promise<R> {
    const { rows } = await this.execute<R, I>(queryConfig);
    if (!rows || !Array.isArray(rows) || rows.length < 1) {
      throw new NotFoundError('No rows returned');
    }
    return rows[0];
  }

  /**
   * Executes a SQL call, returns an array of objects.
   * @param queryConfig SQL call to execute
   * @throws {DatabaseError} when connection or query fails
   */
  public async callTable<R extends QueryResultRow, I extends readonly unknown[] = readonly unknown[]>(
    queryConfig: QueryConfig<I>
  ): Promise<R[]> {
    const { rows } = await this.execute<R, I>(queryConfig);
    return rows;
  }

  /**
   * Executes a SQL call, returns number of rows affected.
   * @param queryConfig SQL call to execute
   * @throws {DatabaseError} when connection or query fails
   */
  public async callModifyOperation<I extends readonly unknown[] = readonly unknown[]>(
    queryConfig: QueryConfig<I>
  ): Promise<number> {
    const result = await this.execute(queryConfig);
    return result.rowCount ?? 0;
  }

  protected abstract getClient(): Promise<ClientBase>;

  protected abstract cleanupClient(client: ClientBase): Promise<void>;

  /**
   * Executes a SQL statement, correctly managing the client lifecycle.
   * @param queryConfig SQL query to execute
   * @throws {DatabaseError} when connection or query fails
   */
  protected async execute<R extends QueryResultRow, I extends readonly unknown[] = readonly unknown[]>(
    queryConfig: QueryConfig<I>
  ): Promise<QueryResult<R>> {
    const client = await this.getClient();
    try {
      return await client.query<R, I>(queryConfig);
    } catch (error: unknown) {
      if (error instanceof DatabaseError || error instanceof NotFoundError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown database error';
      throw new DatabaseError(message, queryConfig.text, queryConfig.values);
    } finally {
      await this.cleanupClient(client);
    }
  }
}
