import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { isDefined } from '@lib';

import { AppConfig } from '@config/config.js';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('stc-api');

  if (!isDefined(appConfig)) {
    throw new Error('Config is not defined');
  }

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.flushLogs();

  app.setGlobalPrefix('/v1/api');

  if (!appConfig.isProduction) {
    const config = new DocumentBuilder()
      .setTitle('STC Backend API')
      .setDescription('The STC Backend API description')
      .setVersion('1.0')
      .addServer(`http://localhost:{port}`, 'Local server', {
        port: {
          default: 3000,
        },
      })
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('v1/api/docs', app, documentFactory);
  }

  if (appConfig.isDevelopment) {
    app.enableCors({
      origin: '*',
    });
  } else {
    /**
     * TODO: Configure CORS for production environment
     * app.enableCors({});
     */
  }

  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();
