import { Router } from "express";
import { SubscriptionController } from "../subscription/legacy.subscription.controller.js";

const router = Router();

router.post("/", SubscriptionController.create);
router.get("/me", SubscriptionController.mySubs);
router.patch("/:id/cancel", SubscriptionController.cancel);

export default router;