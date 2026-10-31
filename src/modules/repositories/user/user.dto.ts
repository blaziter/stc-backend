import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { IsArrayOf } from '@lib/decorators/property.decorator.js';

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
