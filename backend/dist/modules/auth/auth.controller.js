import { AppError } from "../../middleware/errorMiddleware.js";
import { authService } from "./auth.service.js";
const setAuthCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
};
export const authController = {
    register: async (req, res, next) => {
        try {
            const { role } = req.body;
            if (!req.user && role && role !== "customer") {
                throw new AppError("Public registration is only allowed for customers", 403);
            }
            if (req.user) {
                const isAdmin = ["admin", "super-admin"].includes(req.user.role);
                if (!isAdmin && role !== "customer") {
                    throw new AppError("Not authorized to create this role", 403);
                }
            }
            await authService.register(req.body);
            res.status(201).json({ status: "success", message: "Registration successful" });
        }
        catch (error) {
            next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const { token, role } = await authService.login(email, password);
            setAuthCookie(res, token);
            res.status(200).json({ status: "success", message: "Login successful", data: { role } });
        }
        catch (error) {
            next(error);
        }
    },
    me: async (req, res, next) => {
        try {
            const data = await authService.me(req.user);
            res.status(200).json({ status: "success", data });
        }
        catch (error) {
            next(error);
        }
    },
    role: async (req, res, next) => {
        try {
            const userRole = await authService.role(req.user);
            res.status(200).json({ status: "success", data: userRole });
        }
        catch (error) {
            next(error);
        }
    },
    forgotPassword: async (req, res, next) => {
        try {
            const { email } = req.body;
            await authService.forgotPassword(email, process.env.CLIENT_URL);
            res.status(200).json({ status: "success", message: "Reset link sent to email" });
        }
        catch (error) {
            next(error);
        }
    },
    resetPassword: async (req, res, next) => {
        try {
            const { token, password } = req.body;
            await authService.resetPassword(token, password);
            res.status(200).json({ status: "success", message: "Password reset successful" });
        }
        catch (error) {
            next(error);
        }
    },
    logout: async (req, res, next) => {
        try {
            const token = req.cookies?.token;
            await authService.logout(token);
            res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none", path: "/" });
            res.status(200).json({ status: "success", message: "Logged out successfully" });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map