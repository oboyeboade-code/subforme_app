import { Router } from "express";
import { cartController } from "./cart.controller.js";
// Mounted at /api/cart (protect applied at server.ts mount).
const router = Router();
router.get("/", cartController.get);
router.post("/", cartController.add);
router.delete("/", cartController.clear);
router.patch("/:serviceId", cartController.update);
router.delete("/:serviceId", cartController.remove);
export default router;
//# sourceMappingURL=cart.routes.js.map