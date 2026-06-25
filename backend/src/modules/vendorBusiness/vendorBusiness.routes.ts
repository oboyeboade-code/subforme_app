import { Router } from "express";
import { VendorController } from "../vendorBusiness/vendorBusiness.controller.js";

const router = Router();

/**
 * Vendor portal — current logged-in vendor.
 * MUST come before the /:id route so "me" / "me/earnings" aren't
 * captured as the dynamic id segment.
 */
router.get("/me", VendorController.me);
router.get("/me/earnings", VendorController.earnings);
router.post("/me/redeem", VendorController.redeem);

/** Public vendor profile by id. */
router.get("/:id", VendorController.getVendor);

export default router;
