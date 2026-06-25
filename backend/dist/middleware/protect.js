import jwt from "jsonwebtoken";
import Blacklist from "../modules/auth/blacklist.model.js";
import { AppError } from "./errorMiddleware.js";
export const protect = async (req, _res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            throw new AppError("Not authorized, no token provided", 401);
        }
        const blacklisted = await Blacklist.findOne({ token });
        if (blacklisted) {
            throw new AppError("Session invalid, please login again", 401);
        }
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new AppError("Server misconfiguration", 500);
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=protect.js.map