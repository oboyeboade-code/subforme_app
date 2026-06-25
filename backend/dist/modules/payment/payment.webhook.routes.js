import express from "express";
import { paystackWebhook } from "../payment/payment.controller.js";
// Mounted at /api/webhooks — Paystack calls /api/webhooks/paystack.
// DO NOT add `protect`; signature verification happens inside the handler.
const router = express.Router();
router.post("/paystack", paystackWebhook);
export default router;
//# sourceMappingURL=payment.webhook.routes.js.map