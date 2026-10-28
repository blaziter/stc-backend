import { registerAs } from '@nestjs/config';

export class AppConfig {
  get port(): number {
    return parseInt(process.env.PORT as string);
  }

  get nodeEnvironment(): string {
    return process.env.NODE_ENV as string;
  }

  get isProduction(): boolean {
    return this.nodeEnvironment === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnvironment !== 'production';
  }
}

export default registerAs('stc-api', (): AppConfig => new AppConfig());
