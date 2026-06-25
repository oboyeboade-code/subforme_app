import { Router } from "express";
import { wishlistController } from "./wishlist.controller.js";
// Mounted at /api/wishlist (protect applied at server.ts mount).
const router = Router();
router.get("/", wishlistController.get);
router.post("/", wishlistController.add);
router.delete("/", wishlistController.clear);
router.delete("/:serviceId", wishlistController.remove);
export default router;
//# sourceMappingURL=wishlist.routes.js.map