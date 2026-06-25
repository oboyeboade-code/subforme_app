import { AppError } from "./errorMiddleware.js";
export const authorize = (...roles) => (req, _res, next) => {
    const userRole = req.user?.role;
    if (!userRole) {
        return next(new AppError("Not authorized", 401));
    }
    if (!roles.includes(userRole)) {
        return next(new AppError("You do not have permission to access this route", 403));
    }
    next();
};
//# sourceMappingURL=authorize.js.map