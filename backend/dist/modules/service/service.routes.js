import { Router } from "express";
import { serviceController } from "./service.controller.js";
const router = Router();
router.get("/", serviceController.allServices);
export default router;
//# sourceMappingURL=service.routes.js.map