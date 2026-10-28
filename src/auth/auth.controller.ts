import { Controller, Post } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Throttle({
  default: {
    ttl: 300000,
    limit: 10,
  },
})
@Controller('auth')
export class AuthController {}
