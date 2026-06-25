import { Router } from "express";
import { voucherController } from "./voucher.controller.js";
import { protect } from "../../middleware/protect.js";
const router = Router();
router.get("/", protect, voucherController.listUserVouchers);
router.get("/market", protect, voucherController.getMarketplaceVouchers);
router.post("/buy", protect, voucherController.buyWithCoins);
router.post("/validate", protect, voucherController.validateForCheckout);
router.post("/consume", voucherController.consumeAfterPayment);
export default router;
//# sourceMappingURL=voucher.routes.js.map