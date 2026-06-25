import express from "express";
import { initPaystack, verifyPaystack } from "../payment/payment.controller.js";
import { protect } from "../../middleware/protect.js";

// Mounted at /api/payments — paths here are relative to that prefix.
const router = express.Router();

router.post("/init", protect, initPaystack);
router.get("/verify/:reference", protect, verifyPaystack);

export default router;
