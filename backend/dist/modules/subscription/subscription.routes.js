import { Router } from "express";
import { subscriptionController } from "./subscription.controller.js";
import { protect } from "../../middleware/protect.js";
const router = Router();
router.get("/", protect, subscriptionController.subscriptions);
export default router;
//# sourceMappingURL=subscription.routes.js.map