import { HTTP_STATUS } from "../../shared/constants/http-status.js";
import { AppError } from "../../shared/errors/app-error.js";
import { logger } from "../../shared/logger/logger.js";
import { authRepository } from "./auth.repository.js";
import type { PermissionCode } from "./permissions.constants.js";

export class AuthorizationService {
  async getUserPermissionCodes(userId: string): Promise<string[]> {
    const roles = await authRepository.findRolesByUserId(userId);
    const roleIds = roles.map((role) => role.id);

    return authRepository.findPermissionCodesByRoleIds(roleIds);
  }

  hasAllPermissions(
    userPermissions: string[],
    requiredPermissions: readonly PermissionCode[],
  ): boolean {
    if (requiredPermissions.length === 0) {
      return true;
    }

    const granted = new Set(userPermissions);
    return requiredPermissions.every((permission) => granted.has(permission));
  }

  async assertHasPermissions(
    userId: string,
    requiredPermissions: readonly PermissionCode[],
  ): Promise<void> {
    const userPermissions = await this.getUserPermissionCodes(userId);
    const allowed = this.hasAllPermissions(
      userPermissions,
      requiredPermissions,
    );

    if (!allowed) {
      logger.warn(
        `Permission denied for user ${userId}. Required: ${requiredPermissions.join(", ")}`,
      );
      throw new AppError("Forbidden", HTTP_STATUS.FORBIDDEN);
    }
  }
}

export const authorizationService = new AuthorizationService();
