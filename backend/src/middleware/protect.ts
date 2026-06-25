import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Blacklist from "../modules/auth/blacklist.model.js";
import { AppError } from "./errorMiddleware.js";
import type { AuthTokenPayload } from "../types/express.js";

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.token as string | undefined;

    if (!token) {
      throw new AppError("Not authorized, no token provided", 401);
    }

    const blacklisted = await Blacklist.findOne({ token });
    if (blacklisted) {
      throw new AppError("Session invalid, please login again", 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError("Server misconfiguration", 500);

    const decoded = jwt.verify(token, secret) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
