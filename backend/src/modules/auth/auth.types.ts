import { TOKEN_KINDS } from "./auth.constants.js";

export type TokenKind = (typeof TOKEN_KINDS)[keyof typeof TOKEN_KINDS];

export type JwtPayload = {
  sub: string;
  organizationId: string;
  email: string;
  type: TokenKind;
};

export type AuthenticatedUser = {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  status: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export type AccessTokenClaims = Omit<JwtPayload, "type"> & {
  type: "access";
};

export type RefreshTokenClaims = Omit<JwtPayload, "type"> & {
  type: "refresh";
};
