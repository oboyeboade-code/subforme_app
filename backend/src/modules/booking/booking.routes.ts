import { Router } from "express";
import { BookingController } from "../booking/booking.controller.js";

const router = Router();

router.post("/", BookingController.create);
router.get("/me", BookingController.myBookings);
router.patch("/:id/confirm", BookingController.confirm);
router.patch("/:id/complete", BookingController.complete);
router.patch("/:id/cancel", BookingController.cancel);

export default router;