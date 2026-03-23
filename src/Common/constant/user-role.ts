export const USER_ROLE = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  DRIVER: 'driver',
} as const;

export const USER_ROLE_FIELD = {
  [USER_ROLE.ADMIN]: 'isAdmin',
  [USER_ROLE.MANAGER]: 'isManager',
  [USER_ROLE.EMPLOYEE]: 'isEmployee',
  [USER_ROLE.DRIVER]: 'isDriver',
} as const;
