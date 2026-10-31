import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFoundError extends HttpException {
  public constructor(message = 'No rows returned') {
    super(message, HttpStatus.NOT_FOUND);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DatabaseError extends HttpException {
  public constructor(
    message: string,
    public readonly query?: string,
    public readonly values?: readonly unknown[]
  ) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class TransactionError extends Error {
  public constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'TransactionError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
