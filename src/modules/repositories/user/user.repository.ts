import crypto from 'node:crypto';
import sql from 'sequencework-sql-global';
import { Injectable, Logger } from '@nestjs/common';

import { PostgresService } from '@services/postgres';

import {
  CreateUserBodyDto,
  CreateUserBodyResultDto,
  FindUserByIdResultDto,
  LoginUserResultDto,
} from './user.dto.js';

@Injectable()
export class UsersRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async findById(id: string): Promise<FindUserByIdResultDto> {
    const user = await this.postgresService.callSingle(sql`
      SELECT id, email, first_name, last_name, phone_number, active, created_at, updated_at
      FROM users
      WHERE id = ${id}
    `);

    const userRoles = await this.postgresService.callTable(sql`
      SELECT id, name, description
      FROM user_roles INNER JOIN roles ON user_roles.role_id = roles.id
      WHERE user_id = ${user.id}
    `);

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phoneNumber: user.phone_number,
      active: user.active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      roles: userRoles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
      })),
    };
  }

  async findByEmail(email: string): Promise<LoginUserResultDto> {
    const user = await this.postgresService.callSingle(sql`
      SELECT id, email, first_name, last_name, password_hash, password_salt, phone_number, active, created_at, updated_at
      FROM users 
      WHERE email = ${email}
    `);

    const userRoles = await this.postgresService.callTable(sql`
      SELECT id, name, description
      FROM user_roles INNER JOIN roles ON user_roles.role_id = roles.id
      WHERE user_id = ${user.id}
    `);

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phoneNumber: user.phone_number,
      active: user.active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      passwordHash: user.password_hash,
      passwordSalt: user.password_salt,
      roles: userRoles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
      })),
    };
  }
}
