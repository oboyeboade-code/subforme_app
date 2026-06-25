import { Router } from "express";
import { profileController } from "../user/profile.controller.js";
import { protect } from "../../middleware/protect.js";
const router = Router();
router.get("/profile", protect, profileController.get);
router.patch("/profile", protect, profileController.update);
export default router;
//# sourceMappingURL=profile.routes.js.map