import { and, asc, count, desc, eq, ilike, inArray, isNull, or } from "drizzle-orm";
import { db, type DbExecutor } from "../../db/index.js";
import { roles, userRoles, users } from "../../db/schema/index.js";

export type UserRecord = typeof users.$inferSelect;
export type RoleRecord = typeof roles.$inferSelect;

export type ListUsersFilters = {
  organizationId: string;
  search?: string;
  page: number;
  pageSize: number;
};

export type CreateUserData = {
  organizationId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
};

export type UpdateUserData = {
  fullName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status?: string;
};

export class UsersRepository {
  async runInTransaction<T>(
    callback: (tx: DbExecutor) => Promise<T>,
  ): Promise<T> {
    return db.transaction(async (tx) => callback(tx));
  }

  async countByOrganization(
    filters: Omit<ListUsersFilters, "page" | "pageSize">,
    executor: DbExecutor = db,
  ): Promise<number> {
    const conditions = [
      eq(users.organizationId, filters.organizationId),
      isNull(users.deletedAt),
    ];

    if (filters.search) {
      const term = `%${filters.search}%`;
      conditions.push(
        or(ilike(users.fullName, term), ilike(users.email, term))!,
      );
    }

    const [result] = await executor
      .select({ value: count() })
      .from(users)
      .where(and(...conditions));

    return Number(result?.value ?? 0);
  }

  async findManyByOrganization(
    filters: ListUsersFilters,
    executor: DbExecutor = db,
  ): Promise<UserRecord[]> {
    const conditions = [
      eq(users.organizationId, filters.organizationId),
      isNull(users.deletedAt),
    ];

    if (filters.search) {
      const term = `%${filters.search}%`;
      conditions.push(
        or(ilike(users.fullName, term), ilike(users.email, term))!,
      );
    }

    const offset = (filters.page - 1) * filters.pageSize;

    return executor
      .select()
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.createdAt), asc(users.id))
      .limit(filters.pageSize)
      .offset(offset);
  }

  async findByIdAndOrganization(
    userId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<UserRecord | null> {
    const [user] = await executor
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          eq(users.organizationId, organizationId),
          isNull(users.deletedAt),
        ),
      )
      .limit(1);

    return user ?? null;
  }

  async findByEmail(
    email: string,
    executor: DbExecutor = db,
  ): Promise<UserRecord | null> {
    const [user] = await executor
      .select()
      .from(users)
      .where(and(eq(users.email, email.toLowerCase()), isNull(users.deletedAt)))
      .limit(1);

    return user ?? null;
  }

  async create(
    data: CreateUserData,
    executor: DbExecutor = db,
  ): Promise<UserRecord> {
    const [user] = await executor
      .insert(users)
      .values({
        organizationId: data.organizationId,
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
        status: data.status,
      })
      .returning();

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }

  async update(
    userId: string,
    organizationId: string,
    data: UpdateUserData,
    executor: DbExecutor = db,
  ): Promise<UserRecord> {
    const [user] = await executor
      .update(users)
      .set(data)
      .where(
        and(
          eq(users.id, userId),
          eq(users.organizationId, organizationId),
          isNull(users.deletedAt),
        ),
      )
      .returning();

    if (!user) {
      throw new Error("Failed to update user");
    }

    return user;
  }

  async softDelete(
    userId: string,
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<UserRecord> {
    const [user] = await executor
      .update(users)
      .set({ deletedAt: new Date(), status: "inactive" })
      .where(
        and(
          eq(users.id, userId),
          eq(users.organizationId, organizationId),
          isNull(users.deletedAt),
        ),
      )
      .returning();

    if (!user) {
      throw new Error("Failed to delete user");
    }

    return user;
  }

  async findRolesByIdsAndOrganization(
    roleIds: string[],
    organizationId: string,
    executor: DbExecutor = db,
  ): Promise<RoleRecord[]> {
    if (roleIds.length === 0) {
      return [];
    }

    return executor
      .select()
      .from(roles)
      .where(
        and(
          inArray(roles.id, roleIds),
          eq(roles.organizationId, organizationId),
        ),
      );
  }

  async findRolesByUserIds(
    userIds: string[],
    executor: DbExecutor = db,
  ): Promise<Array<{ userId: string; role: RoleRecord }>> {
    if (userIds.length === 0) {
      return [];
    }

    const rows = await executor
      .select({
        userId: userRoles.userId,
        role: roles,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(inArray(userRoles.userId, userIds));

    return rows;
  }

  async deleteUserRoles(
    userId: string,
    executor: DbExecutor = db,
  ): Promise<void> {
    await executor.delete(userRoles).where(eq(userRoles.userId, userId));
  }

  async assignRoles(
    userId: string,
    roleIds: string[],
    assignedBy: string,
    executor: DbExecutor = db,
  ): Promise<void> {
    if (roleIds.length === 0) {
      return;
    }

    await executor.insert(userRoles).values(
      roleIds.map((roleId) => ({
        userId,
        roleId,
        assignedBy,
      })),
    );
  }
}

export const usersRepository = new UsersRepository();
