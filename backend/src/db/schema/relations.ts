import { relations } from "drizzle-orm";
import { aiGenerations } from "./ai-generations.js";
import { auditLogs } from "./audit-logs.js";
import { consultations } from "./consultations.js";
import { conversationMessages } from "./conversation-messages.js";
import { organizationSettings } from "./organization-settings.js";
import { organizations } from "./organizations.js";
import { permissions } from "./permissions.js";
import { refreshTokens } from "./refresh-tokens.js";
import { rolePermissions } from "./role-permissions.js";
import { roles } from "./roles.js";
import { userRoles } from "./user-roles.js";
import { userSettings } from "./user-settings.js";
import { users } from "./users.js";
import { verificationTokens } from "./verification-tokens.js";

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  roles: many(roles),
  settings: many(organizationSettings),
  auditLogs: many(auditLogs),
  consultations: many(consultations),
  conversationMessages: many(conversationMessages),
  aiGenerations: many(aiGenerations),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  roles: many(userRoles, {
    relationName: "userRoleUser",
  }),
  assignedUserRoles: many(userRoles, {
    relationName: "userRoleAssigner",
  }),
  refreshTokens: many(refreshTokens),
  verificationTokens: many(verificationTokens),
  settings: many(userSettings),
  auditLogs: many(auditLogs),
  createdConsultations: many(consultations, {
    relationName: "consultationCreator",
  }),
  assignedConsultations: many(consultations, {
    relationName: "consultationAssignee",
  }),
  conversationMessages: many(conversationMessages),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [roles.organizationId],
    references: [organizations.id],
  }),
  permissions: many(rolePermissions),
  users: many(userRoles),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
    relationName: "userRoleUser",
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  assignedByUser: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id],
    relationName: "userRoleAssigner",
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const verificationTokensRelations = relations(
  verificationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [verificationTokens.userId],
      references: [users.id],
    }),
  }),
);

export const organizationSettingsRelations = relations(
  organizationSettings,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationSettings.organizationId],
      references: [organizations.id],
    }),
  }),
);

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditLogs.organizationId],
    references: [organizations.id],
  }),
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));

export const consultationsRelations = relations(
  consultations,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [consultations.organizationId],
      references: [organizations.id],
    }),
    creator: one(users, {
      fields: [consultations.createdBy],
      references: [users.id],
      relationName: "consultationCreator",
    }),
    assignee: one(users, {
      fields: [consultations.assignedTo],
      references: [users.id],
      relationName: "consultationAssignee",
    }),
    messages: many(conversationMessages),
    aiGenerations: many(aiGenerations),
  }),
);

export const conversationMessagesRelations = relations(
  conversationMessages,
  ({ one, many }) => ({
    consultation: one(consultations, {
      fields: [conversationMessages.consultationId],
      references: [consultations.id],
    }),
    organization: one(organizations, {
      fields: [conversationMessages.organizationId],
      references: [organizations.id],
    }),
    creator: one(users, {
      fields: [conversationMessages.createdBy],
      references: [users.id],
    }),
    aiGenerations: many(aiGenerations),
  }),
);

export const aiGenerationsRelations = relations(aiGenerations, ({ one }) => ({
  organization: one(organizations, {
    fields: [aiGenerations.organizationId],
    references: [organizations.id],
  }),
  consultation: one(consultations, {
    fields: [aiGenerations.consultationId],
    references: [consultations.id],
  }),
  conversationMessage: one(conversationMessages, {
    fields: [aiGenerations.conversationMessageId],
    references: [conversationMessages.id],
  }),
}));
