export const userRoles = ["customer", "provider", "admin", "super_admin"] as const;

export type UserRole = (typeof userRoles)[number];
