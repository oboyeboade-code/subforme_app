import { Router } from "express";
import { AdminController } from "../admin/admin.controller.js";
const router = Router();
/* OVERVIEW */
router.get("/overview", AdminController.overview);
router.get("/settings", AdminController.settings);
/* VENDORS */
router.get("/vendors", AdminController.getVendors);
router.get("/vendors/:id", AdminController.getVendorById);
/* PROVIDERS (create/update/delete vendors) */
router.post("/providers", AdminController.createProvider);
router.patch("/providers/:id", AdminController.updateProvider);
router.delete("/providers/:id", AdminController.deleteProvider);
/* SERVICES */
router.get("/services", AdminController.getServices);
router.post("/services", AdminController.createService);
router.patch("/services/:id", AdminController.updateService);
router.delete("/services/:id", AdminController.deleteService);
/* SERVICE CODES */
router.get("/codes", AdminController.getServiceCodes);
router.post("/codes/refresh", AdminController.refreshCodes);
/* ADMINS */
router.get("/admins", AdminController.getAdmins);
router.post("/admins", AdminController.createAdmin);
router.patch("/admins/:id", AdminController.updateAdmin);
router.delete("/admins/:id", AdminController.deleteAdmin);
/* CONTACT MESSAGES (stubs) */
router.get("/contact-messages", AdminController.getContactMessages);
router.patch("/contact-messages/:id", AdminController.updateContactMessage);
/* LISTING REQUESTS (admin view; user-side lives at /api/listing-requests) */
router.get("/listing-requests", AdminController.getListingRequests);
router.patch("/listing-requests/:id/review", AdminController.reviewListingRequest);
export default router;
//# sourceMappingURL=admin.routes.js.map