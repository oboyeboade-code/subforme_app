import { Router } from "express";
import { homeController } from "./home.controller.js";
const router = Router();
router.get("/top-providers", homeController.getTopProviders);
router.get("/categories", homeController.getCategories);
router.get("/platform-metrics", homeController.getPlatformMetrics);
export default router;
//# sourceMappingURL=home.routes.js.map