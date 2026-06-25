import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorMiddleware.js";
import type { UserRole } from "../modules/_shared/user.model.js";

export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole) {
      return next(new AppError("Not authorized", 401));
    }

    if (!roles.includes(userRole)) {
      return next(
        new AppError("You do not have permission to access this route", 403)
      );
    }

    next();
  };