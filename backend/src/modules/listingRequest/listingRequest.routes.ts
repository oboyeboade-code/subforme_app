import { Router } from "express";
import { ListingRequestController } from "../listingRequest/listingRequest.controller.js";

const router = Router();

// user submits request
router.post("/", ListingRequestController.create);

// user sees own requests
router.get("/me", ListingRequestController.myRequests);

// admin sees all requests
router.get("/all", ListingRequestController.all);

export default router;