import { Module } from '@nestjs/common';

import { RepositoriesModule } from '@modules/repositories';

import { UserController } from './user.controller.js';

@Module({
  imports: [RepositoriesModule],
  controllers: [UserController],
})
export class UserModule {}
