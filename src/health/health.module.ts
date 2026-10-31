import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { PostgresModule } from '@services/postgres';

import { HealthController } from './health.controller.js';

@Module({
  imports: [TerminusModule, HttpModule, PostgresModule],
  controllers: [HealthController],
})
export class HealthModule {}
