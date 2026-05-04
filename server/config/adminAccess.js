export const SUPER_ADMIN_EMAIL = "alfredmakura6@gmail.com";

export const normalizeEmail = (email = "") => email.trim().toLowerCase();

export const isSuperAdminEmail = (email = "") => normalizeEmail(email) === SUPER_ADMIN_EMAIL;
