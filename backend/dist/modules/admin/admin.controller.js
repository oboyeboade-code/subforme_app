import { AdminService } from "../admin/admin.service.js";
import { ok } from "../../utils/respond.js";
const pid = (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
export const AdminController = {
    async overview(_req, res, next) {
        try {
            ok(res, await AdminService.overview(), "Overview");
        }
        catch (e) {
            next(e);
        }
    },
    async getVendors(_req, res, next) {
        try {
            ok(res, await AdminService.getVendors(), "Vendors");
        }
        catch (e) {
            next(e);
        }
    },
    async getVendorById(req, res, next) {
        try {
            ok(res, await AdminService.getVendorById(pid(req)), "Vendor");
        }
        catch (e) {
            next(e);
        }
    },
    async getServices(_req, res, next) {
        try {
            ok(res, await AdminService.getServices(), "Services");
        }
        catch (e) {
            next(e);
        }
    },
    async getServiceCodes(_req, res, next) {
        try {
            ok(res, await AdminService.getServiceCodes(), "Service codes");
        }
        catch (e) {
            next(e);
        }
    },
    async settings(_req, res, next) {
        try {
            ok(res, await AdminService.settings(), "Settings");
        }
        catch (e) {
            next(e);
        }
    },
    async createProvider(req, res, next) {
        try {
            ok(res, await AdminService.createProvider(req.body), "Provider created", 201);
        }
        catch (e) {
            next(e);
        }
    },
    async updateProvider(req, res, next) {
        try {
            ok(res, await AdminService.updateProvider(pid(req), req.body), "Provider updated");
        }
        catch (e) {
            next(e);
        }
    },
    async deleteProvider(req, res, next) {
        try {
            await AdminService.deleteProvider(pid(req));
            ok(res, { id: pid(req) }, "Provider deleted");
        }
        catch (e) {
            next(e);
        }
    },
    async createService(req, res, next) {
        try {
            ok(res, await AdminService.createService(req.body), "Service created", 201);
        }
        catch (e) {
            next(e);
        }
    },
    async updateService(req, res, next) {
        try {
            ok(res, await AdminService.updateService(pid(req), req.body), "Service updated");
        }
        catch (e) {
            next(e);
        }
    },
    async deleteService(req, res, next) {
        try {
            await AdminService.deleteService(pid(req));
            ok(res, { id: pid(req) }, "Service deleted");
        }
        catch (e) {
            next(e);
        }
    },
    async getAdmins(_req, res, next) {
        try {
            ok(res, await AdminService.getAdmins(), "Admins");
        }
        catch (e) {
            next(e);
        }
    },
    async createAdmin(req, res, next) {
        try {
            ok(res, await AdminService.createAdmin(req.body), "Admin created", 201);
        }
        catch (e) {
            next(e);
        }
    },
    async updateAdmin(req, res, next) {
        try {
            ok(res, await AdminService.updateAdmin(pid(req), req.body), "Admin updated");
        }
        catch (e) {
            next(e);
        }
    },
    async deleteAdmin(req, res, next) {
        try {
            await AdminService.deleteAdmin(pid(req));
            ok(res, { id: pid(req) }, "Admin deleted");
        }
        catch (e) {
            next(e);
        }
    },
    async refreshCodes(_req, res, next) {
        try {
            ok(res, await AdminService.refreshCodes(), "Codes refreshed");
        }
        catch (e) {
            next(e);
        }
    },
    // --- Contact messages (stub — wire to AdminService when implemented) ---
    async getContactMessages(_req, res, next) {
        try {
            const data = AdminService.getContactMessages
                ? await AdminService.getContactMessages()
                : [];
            ok(res, data, "Contact messages");
        }
        catch (e) {
            next(e);
        }
    },
    async updateContactMessage(req, res, next) {
        try {
            const data = AdminService.updateContactMessage
                ? await AdminService.updateContactMessage(pid(req), req.body)
                : { id: pid(req), ...req.body };
            ok(res, data, "Contact message updated");
        }
        catch (e) {
            next(e);
        }
    },
    // --- Listing requests (admin view; user-facing routes live in listingRequest module) ---
    async getListingRequests(_req, res, next) {
        try {
            const data = AdminService.getListingRequests
                ? await AdminService.getListingRequests()
                : [];
            ok(res, data, "Listing requests");
        }
        catch (e) {
            next(e);
        }
    },
    async reviewListingRequest(req, res, next) {
        try {
            const { status, reviewerNote } = req.body ?? {};
            const data = AdminService.reviewListingRequest
                ? await AdminService.reviewListingRequest(pid(req), status, reviewerNote)
                : { id: pid(req), status, reviewerNote };
            ok(res, data, "Listing request reviewed");
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=admin.controller.js.map