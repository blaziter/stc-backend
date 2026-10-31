import { LoggerModule } from 'nestjs-pino';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { PostgresModule } from '@services/postgres';

import { configs } from '@config';
import { HealthModule } from '@health';
import { AuthModule } from '@modules/app/auth';
import { UserModule } from '@modules/app/user';
import { RepositoriesModule } from '@modules/repositories';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.local', '.env.development.local'],
      isGlobal: true,
      load: [configs.config, configs.postgresConfig],
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    }),
    HealthModule,
    LoggerModule.forRoot({
      pinoHttp: {
        name: 'stc-api',
        redact: ['req.headers.authorization'],
        serializers: {
          req: ({ method, url, params, query, headers, remoteAddress }: any) => {
            return {
              method,
              url,
              params,
              query,
              headers: {
                'user-agent': headers?.['user-agent'],
                'content-type': headers?.['content-type'],
                'content-length': headers?.['content-length'],
                'cache-control': headers?.['cache-control'],
                authorization: headers?.authorization,
                referer: headers.referer,
              },
              remoteAddress,
            };
          },
          res: ({ statusCode, headers }: any) => {
            return {
              statusCode,
              headers: {
                'user-agent': headers?.['user-agent'],
                'content-type': headers?.['content-type'],
                'content-length': headers?.['content-length'],
                'cache-control': headers?.['cache-control'],
                age: headers.age,
                location: headers.location,
              },
            };
          },
        },
        quietReqLogger: true,
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
    AuthModule,
    PostgresModule,
    UserModule,
    RepositoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
