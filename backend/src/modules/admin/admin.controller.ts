import { Request, Response, NextFunction } from "express";
import { AdminService } from "../admin/admin.service.js";
import { ok } from "../../utils/respond.js";

const pid = (req: Request) =>
  Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

export const AdminController = {
  async overview(_req: Request, res: Response, next: NextFunction) {
    try { ok(res, await AdminService.overview(), "Overview"); } catch (e) { next(e); }
  },

  async getVendors(_req: Request, res: Response, next: NextFunction) {
    try { ok(res, await AdminService.getVendors(), "Vendors"); } catch (e) { next(e); }
  },

  async getVendorById(req: Request, res: Response, next: NextFunction) {
    try { ok(res, await AdminService.getVendorById(pid(req)), "Vendor"); } catch (e) { next(e); }
  },

  async getServices(_req: Request, res: Response, next: NextFunction) {
    try { ok(res, await AdminService.getServices(), "Services"); } catch (e) { next(e); }
  },

  async getServiceCodes(_req: Request, res: Response, next: NextFunction) {
    try { ok(res, await AdminService.getServiceCodes(), "Service codes"); } catch (e) { next(e); }
  },

  async settings(_req: Request, res: Response, next: NextFunction) {
    try { ok(res, await AdminService.settings(), "Settings"); } catch (e) { next(e); }
  },

  async createProvider(req: Request, res: Response, next: NextFunction) {
    try { ok(res, await AdminService.createProvider(req.body), "Provider created", 201); } catch (e) { next(e); }
  },

  async updateProvider(req: Request, res: Response, next: NextFunction) {
    try { ok(res, await AdminService.updateProvider(pid(req), req.body), "Provider updated"); } catch (e) { next(e); }
  },

  async deleteProvider(req: Request, res: Response, next: NextFunction) {
    try { await AdminService.deleteProvider(pid(req)); ok(res, { id: pid(req) }, "Provider deleted"); } catch (e) { next(e); }
  },

  async createService(req: Request, res: Response, next: NextFunction) {
    try { ok(res, await AdminService.createService(req.body), "Service created", 201); } catch (e) { next(e); }
  },

  async updateService(req: Request, res: Response, next: NextFunction) {
    try { ok(res, await AdminService.updateService(pid(req), req.body), "Service updated"); } catch (e) { next(e); }
  },

  async deleteService(req: Request, res: Response, next: NextFunction) {
    try { await AdminService.deleteService(pid(req)); ok(res, { id: pid(req) }, "Service deleted"); } catch (e) { next(e); }
  },

  async getAdmins(_req: Request, res: Response, next: NextFunction) {
    try { ok(res, await AdminService.getAdmins(), "Admins"); } catch (e) { next(e); }
  },

  async createAdmin(req: Request, res: Response, next: NextFunction) {
    try { ok(res, await AdminService.createAdmin(req.body), "Admin created", 201); } catch (e) { next(e); }
  },

  async updateAdmin(req: Request, res: Response, next: NextFunction) {
    try { ok(res, await AdminService.updateAdmin(pid(req), req.body), "Admin updated"); } catch (e) { next(e); }
  },

  async deleteAdmin(req: Request, res: Response, next: NextFunction) {
    try { await AdminService.deleteAdmin(pid(req)); ok(res, { id: pid(req) }, "Admin deleted"); } catch (e) { next(e); }
  },

  async refreshCodes(_req: Request, res: Response, next: NextFunction) {
    try { ok(res, await AdminService.refreshCodes(), "Codes refreshed"); } catch (e) { next(e); }
  },

  // --- Contact messages (stub — wire to AdminService when implemented) ---
  async getContactMessages(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = (AdminService as any).getContactMessages
        ? await (AdminService as any).getContactMessages()
        : [];
      ok(res, data, "Contact messages");
    } catch (e) { next(e); }
  },

  async updateContactMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = (AdminService as any).updateContactMessage
        ? await (AdminService as any).updateContactMessage(pid(req), req.body)
        : { id: pid(req), ...req.body };
      ok(res, data, "Contact message updated");
    } catch (e) { next(e); }
  },

  // --- Listing requests (admin view; user-facing routes live in listingRequest module) ---
  async getListingRequests(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = (AdminService as any).getListingRequests
        ? await (AdminService as any).getListingRequests()
        : [];
      ok(res, data, "Listing requests");
    } catch (e) { next(e); }
  },

  async reviewListingRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, reviewerNote } = req.body ?? {};
      const data = (AdminService as any).reviewListingRequest
        ? await (AdminService as any).reviewListingRequest(pid(req), status, reviewerNote)
        : { id: pid(req), status, reviewerNote };
      ok(res, data, "Listing request reviewed");
    } catch (e) { next(e); }
  },
};

