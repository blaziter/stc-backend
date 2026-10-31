import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Role {
  @ApiProperty({
    description: 'Role identifier',
    example: '1',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Role name',
    example: 'admin',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Administrator with full system permissions',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  description: string;
}
