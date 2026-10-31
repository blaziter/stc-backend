import { Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { FindUserByIdParamsDto, FindUserByIdResultDto, UsersRepository } from '@modules/repositories/user';

@ApiTags('Users')
@Controller('user')
export class UserController {
  public constructor(private readonly userRepository: UsersRepository) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a user profile and assigned roles using their UUID.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'User UUID identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    type: FindUserByIdResultDto,
    description: 'User retrieved successfully.',
  })
  @ApiNotFoundResponse({
    description: 'User with the given ID was not found.',
  })
  public async getUser(@Param() params: FindUserByIdParamsDto): Promise<FindUserByIdResultDto> {
    return await this.userRepository.findById(params.id);
  }
}
