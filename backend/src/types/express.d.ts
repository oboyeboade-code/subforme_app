import type { JwtPayload } from "jsonwebtoken";

export type UserRole =
  | "super-admin"
  | "admin"
  | "customer"
  | "vendor";

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export {};