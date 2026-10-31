import { Type as TransformType } from 'class-transformer';
import { IsArray, ValidateNested, ValidationOptions } from 'class-validator';
import { applyDecorators, Type as NestType } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function IsArrayOf<T>(typeFn: () => NestType<T>, validationOptions?: ValidationOptions) {
  const decorators: PropertyDecorator[] = [
    IsArray({ ...validationOptions }),
    ValidateNested({ each: true, ...validationOptions }),
    TransformType(() => typeFn()),
    ApiProperty({
      type: () => [typeFn()],
      ...validationOptions,
    }),
  ];

  return applyDecorators(...decorators);
}
