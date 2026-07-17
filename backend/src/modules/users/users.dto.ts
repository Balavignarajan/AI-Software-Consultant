export type UserRoleDto = {
  id: string;
  name: string;
  slug: string;
};

export type UserDto = {
  id: string;
  organizationId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  status: string;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  roles: UserRoleDto[];
};

export type PaginationMetaDto = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedUsersDto = {
  items: UserDto[];
  meta: PaginationMetaDto;
};
