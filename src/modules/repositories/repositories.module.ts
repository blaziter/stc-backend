import { Module } from '@nestjs/common';

import { PostgresModule } from '@services/postgres';

import { UsersRepository } from './user/user.repository.js';

@Module({
  imports: [PostgresModule],
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class RepositoriesModule {}
