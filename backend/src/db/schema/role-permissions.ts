import { index, pgTable, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createdAt } from "./helpers.js";
import { permissions } from "./permissions.js";
import { roles } from "./roles.js";

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    uniqueIndex("role_permissions_role_permission_uidx").on(
      table.roleId,
      table.permissionId,
    ),
    index("role_permissions_role_id_idx").on(table.roleId),
    index("role_permissions_permission_id_idx").on(table.permissionId),
  ],
);
