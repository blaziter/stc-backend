import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, PickType } from '@nestjs/swagger';

import { IsArrayOf } from '@lib/decorators';

import { Role } from '@modules/repositories/role';

export class User {
  @ApiProperty({
    description: 'Unique identifier (UUID v4)',
    format: 'uuid',
  })
  @IsString()
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    description: 'Hashed user password',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  passwordHash: string;

  @ApiProperty({
    description: 'Cryptographic password salt',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  passwordSalt: string;

  @ApiProperty({
    description: 'First name',
    example: 'Petr',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Tran',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+420123456789',
    maxLength: 25,
  })
  @IsString()
  @MaxLength(25)
  phoneNumber: string;

  @ApiProperty({
    description: 'Account active status',
    example: true,
  })
  @IsBoolean()
  active: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-10-31T12:00:00.000Z',
    type: () => Date,
  })
  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-10-31T12:00:00.000Z',
    type: () => Date,
  })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @ApiProperty({
    description: 'User roles list',
    type: () => [Role],
  })
  @IsArrayOf(() => Role)
  roles: Role[];
}

export class CreateUserBodyDto extends PickType(User, [
  'email',
  'firstName',
  'lastName',
  'phoneNumber',
  'roles',
]) {}

export class CreateUserBodyResultDto extends PickType(User, ['id', 'firstName', 'lastName']) {}

export class FindUserByIdParamsDto extends PickType(User, ['id']) {}

export class FindUserByIdResultDto extends PickType(User, [
  'id',
  'email',
  'firstName',
  'lastName',
  'phoneNumber',
  'active',
  'createdAt',
  'updatedAt',
  'roles',
]) {}

export class LoginUserBodyDto extends PickType(User, ['email']) {
  @IsString()
  @MaxLength(100)
  password: string;
}

export class LoginUserResultDto extends PickType(User, [
  'id',
  'email',
  'firstName',
  'lastName',
  'phoneNumber',
  'active',
  'createdAt',
  'updatedAt',
  'passwordHash',
  'passwordSalt',
  'roles',
]) {}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
  })
  @IsString()
  accessToken: string;

  @ApiProperty({
    description: 'Authenticated user profile and roles',
    type: () => FindUserByIdResultDto,
  })
  user: FindUserByIdResultDto;
}
