import { Request, Response, NextFunction } from "express";
import { VendorService } from "../vendorBusiness/vendorBusiness.service.js";
import { VendorBusinessModel } from "../_shared/user.model.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../middleware/errorMiddleware.js";

const pid = (req: Request) =>
  Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

export const VendorController = {
  /**
   * GET /vendor/me
   * Vendor portal — returns the business owned by the logged-in vendor
   * plus services, offers, and service codes.
   */
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError("Unauthorized", 401);

      const business = await VendorBusinessModel.findOne({ ownerUserId: userId });
      if (!business) throw new AppError("Vendor business not found for user", 404);

      const data = await VendorService.getVendorFull(business._id.toString());
      ok(res, data, "Vendor data fetched");
    } catch (e) { next(e); }
  },

  /**
   * GET /vendor/:id
   * Public vendor profile (services + offers + codes).
   */
  async getVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await VendorService.getVendorFull(pid(req));
      ok(res, data, "Vendor data fetched");
    } catch (e) { next(e); }
  },

  /**
   * GET /vendor/me/earnings
   * Aggregated earnings for vendor portal.
   */
  async earnings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError("Unauthorized", 401);

      const business = await VendorBusinessModel.findOne({ ownerUserId: userId });
      if (!business) throw new AppError("Vendor business not found for user", 404);

      const data = await VendorService.getEarnings(business._id.toString());
      ok(res, data, "Earnings fetched");
    } catch (e) { next(e); }
  },

  /**
   * POST /vendor/me/redeem
   * Stub — redeem a customer's service code. Body: { servCode, authCode }.
   * Wire to VendorService.redeemServiceCode(...) when implemented.
   */
  async redeem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError("Unauthorized", 401);

      const { servCode, authCode } = req.body ?? {};
      if (!servCode || !authCode) throw new AppError("servCode and authCode are required", 400);

      // TODO: Implement VendorService.redeemServiceCode(userId, servCode, authCode)
      throw new AppError("Redeem service code not yet implemented", 501);
    } catch (e) { next(e); }
  },

};
