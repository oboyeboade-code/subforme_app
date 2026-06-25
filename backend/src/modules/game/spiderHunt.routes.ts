import { Router } from "express";
import { spiderHuntController } from "./spiderHunt.controller.js";

const router = Router();

// router.post("/spider-hunt/play", spiderHuntController.play);
router.post("/spider-hunt/play", spiderHuntController.play);
router.post("/spider-hunt/start", spiderHuntController.start);
router.post("/spider-hunt/cashout", spiderHuntController.cashout);

export default router;