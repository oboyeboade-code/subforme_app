import { Router } from "express";
import { coinController } from "./coin.controller.js";
import { protect } from "../../middleware/protect.js";

const router = Router();

router.get("/balance", protect, coinController.getBalance);
// router.post("/add", protect, coinController.addCoins);
// router.post("/spend", protect, coinController.spendCoins);

export default router;
