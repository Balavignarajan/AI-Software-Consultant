import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";
import { logger } from "../../shared/logger/logger.js";
import { hashPassword } from "../auth/password.js";
import type {
  PaginatedUsersDto,
  UserDto,
  UserRoleDto,
} from "./users.dto.js";
import {
  usersRepository,
  type RoleRecord,
  type UserRecord,
} from "./users.repository.js";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "./users.validation.js";

function toRoleDto(role: RoleRecord): UserRoleDto {
  return {
    id: role.id,
    name: role.name,
    slug: role.slug,
  };
}

function toUserDto(user: UserRecord, roles: RoleRecord[]): UserDto {
  return {
    id: user.id,
    organizationId: user.organizationId,
    fullName: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    status: user.status,
    emailVerifiedAt: user.emailVerifiedAt,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    roles: roles.map(toRoleDto),
  };
}

function groupRolesByUserId(
  rows: Array<{ userId: string; role: RoleRecord }>,
): Map<string, RoleRecord[]> {
  const map = new Map<string, RoleRecord[]>();

  for (const row of rows) {
    const current = map.get(row.userId) ?? [];
    current.push(row.role);
    map.set(row.userId, current);
  }

  return map;
}

export class UsersService {
  async list(
    organizationId: string,
    query: ListUsersQuery,
  ): Promise<PaginatedUsersDto> {
    const filters = {
      organizationId,
      search: query.search,
      page: query.page,
      pageSize: query.pageSize,
    };

    const [total, users] = await Promise.all([
      usersRepository.countByOrganization(filters),
      usersRepository.findManyByOrganization(filters),
    ]);

    const roleRows = await usersRepository.findRolesByUserIds(
      users.map((user) => user.id),
    );
    const rolesByUserId = groupRolesByUserId(roleRows);

    return {
      items: users.map((user) =>
        toUserDto(user, rolesByUserId.get(user.id) ?? []),
      ),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
      },
    };
  }

  async getById(organizationId: string, userId: string): Promise<UserDto> {
    const user = await usersRepository.findByIdAndOrganization(
      userId,
      organizationId,
    );

    if (!user) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    const roleRows = await usersRepository.findRolesByUserIds([user.id]);
    const roles = roleRows.map((row) => row.role);

    return toUserDto(user, roles);
  }

  async create(
    organizationId: string,
    actorUserId: string,
    input: CreateUserInput,
  ): Promise<UserDto> {
    const existingUser = await usersRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError("Email is already registered", HTTP_STATUS.CONFLICT);
    }

    const roleIds = [...new Set(input.roleIds)];
    const organizationRoles =
      await usersRepository.findRolesByIdsAndOrganization(
        roleIds,
        organizationId,
      );

    if (organizationRoles.length !== roleIds.length) {
      throw new AppError(
        "One or more roles are invalid for this organization",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const passwordHash = await hashPassword(input.password);

    const user = await usersRepository.runInTransaction(async (tx) => {
      const createdUser = await usersRepository.create(
        {
          organizationId,
          fullName: input.fullName,
          email: input.email,
          passwordHash,
          phone: input.phone ?? null,
          avatarUrl: input.avatarUrl ?? null,
          status: "active",
        },
        tx,
      );

      await usersRepository.assignRoles(
        createdUser.id,
        roleIds,
        actorUserId,
        tx,
      );

      return createdUser;
    });

    logger.info(`User created: ${user.email}`);

    return toUserDto(user, organizationRoles);
  }

  async update(
    organizationId: string,
    actorUserId: string,
    userId: string,
    input: UpdateUserInput,
  ): Promise<UserDto> {
    const existingUser = await usersRepository.findByIdAndOrganization(
      userId,
      organizationId,
    );

    if (!existingUser) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    let roleIds: string[] | null = null;
    let assignedRoles: RoleRecord[] | null = null;

    if (input.roleIds) {
      roleIds = [...new Set(input.roleIds)];
      assignedRoles = await usersRepository.findRolesByIdsAndOrganization(
        roleIds,
        organizationId,
      );

      if (assignedRoles.length !== roleIds.length) {
        throw new AppError(
          "One or more roles are invalid for this organization",
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    }

    const updatedUser = await usersRepository.runInTransaction(async (tx) => {
      const user = await usersRepository.update(
        userId,
        organizationId,
        {
          fullName: input.fullName,
          phone: input.phone,
          avatarUrl: input.avatarUrl,
          status: input.status,
        },
        tx,
      );

      if (roleIds) {
        await usersRepository.deleteUserRoles(userId, tx);
        await usersRepository.assignRoles(
          userId,
          roleIds,
          actorUserId,
          tx,
        );
      }

      return user;
    });

    const roleRows = await usersRepository.findRolesByUserIds([userId]);
    const roles = roleRows.map((row) => row.role);

    logger.info(`User updated: ${updatedUser.email}`);

    return toUserDto(updatedUser, roles);
  }

  async remove(organizationId: string, userId: string): Promise<void> {
    const existingUser = await usersRepository.findByIdAndOrganization(
      userId,
      organizationId,
    );

    if (!existingUser) {
      throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }

    await usersRepository.softDelete(userId, organizationId);
    logger.info(`User soft-deleted: ${existingUser.email}`);
  }
}

export const usersService = new UsersService();
