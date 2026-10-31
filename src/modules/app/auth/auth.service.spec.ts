import { Test, TestingModule } from '@nestjs/testing';

import { UsersRepository } from '@modules/repositories/user';

import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: { findByEmail: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    userRepository = {
      findByEmail: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersRepository,
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
