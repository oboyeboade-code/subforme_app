import { Router } from "express";
import { authController } from "./auth.controller.js";
import { protect } from "../../middleware/protect.js";
const router = Router();
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/me", protect, authController.me);
router.get("/role", protect, authController.role);
export default router;
//# sourceMappingURL=auth.routes.js.map