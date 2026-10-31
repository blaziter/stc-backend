import { Test, TestingModule } from '@nestjs/testing';

import { UsersRepository } from '@modules/repositories/user';

import { UserController } from './user.controller.js';

describe('UserController', () => {
  let controller: UserController;
  let userRepository: { findById: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    userRepository = {
      findById: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UsersRepository,
          useValue: userRepository,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return user from repository by id', async () => {
    const mockUser = {
      id: 'uuid-1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '123456789',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [],
    };
    userRepository.findById.mockResolvedValue(mockUser);

    const result = await controller.getUser({ id: 'uuid-1' });
    expect(userRepository.findById).toHaveBeenCalledWith('uuid-1');
    expect(result).toEqual(mockUser);
  });
});
