import "dotenv/config";
import { eq } from "drizzle-orm";
import { SYSTEM_PERMISSION_DEFINITIONS } from "../../modules/auth/permissions.constants.js";
import { logger } from "../../shared/logger/logger.js";
import { db, pool } from "../index.js";
import {
  permissions,
  rolePermissions,
  roles,
} from "../schema/index.js";

export async function seedPermissions(): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .insert(permissions)
      .values(
        SYSTEM_PERMISSION_DEFINITIONS.map((permission) => ({
          code: permission.code,
          module: permission.module,
          description: permission.description,
        })),
      )
      .onConflictDoNothing({ target: permissions.code });

    const allPermissions = await tx.select().from(permissions);
    const permissionIds = allPermissions.map((permission) => permission.id);

    if (permissionIds.length === 0) {
      logger.warn("No permissions available to assign to Admin roles");
      return;
    }

    const adminRoles = await tx
      .select()
      .from(roles)
      .where(eq(roles.slug, "admin"));

    for (const adminRole of adminRoles) {
      await tx
        .insert(rolePermissions)
        .values(
          permissionIds.map((permissionId) => ({
            roleId: adminRole.id,
            permissionId,
          })),
        )
        .onConflictDoNothing({
          target: [rolePermissions.roleId, rolePermissions.permissionId],
        });
    }

    logger.info(
      `Permissions seed complete. permissions=${allPermissions.length}, adminRolesUpdated=${adminRoles.length}`,
    );
  });
}

async function run(): Promise<void> {
  try {
    await seedPermissions();
    logger.info("Permission bootstrap finished successfully");
  } finally {
    await pool.end();
  }
}

const entrypoint = process.argv[1] ?? "";
const isDirectRun =
  entrypoint.endsWith("permissions.seed.ts") ||
  entrypoint.endsWith("permissions.seed.js");

if (isDirectRun) {
  void run().catch((error: unknown) => {
    logger.error(
      error instanceof Error
        ? error.message
        : "Permission bootstrap failed",
    );
    process.exitCode = 1;
  });
}
