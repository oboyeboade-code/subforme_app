import { Request, Response, NextFunction } from "express";
import { ListingRequestService } from "../listingRequest/listingRequest.service.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../middleware/errorMiddleware.js";

export const ListingRequestController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError("Unauthorized", 401);
      const request = await ListingRequestService.createRequest({
        userId,
        type: req.body.type,
        vendorBusinessId: req.body.vendorBusinessId,
        payload: req.body.payload,
      });
      ok(res, request, "Listing request submitted", 201);
    } catch (e) { next(e); }
  },

  async myRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError("Unauthorized", 401);
      const requests = await ListingRequestService.getUserRequests(userId);
      ok(res, requests, "Listing requests fetched");
    } catch (e) { next(e); }
  },

  async all(req: Request, res: Response, next: NextFunction) {
    try {
      const requests = await ListingRequestService.getAllRequests();
      ok(res, requests, "Listing requests fetched");
    } catch (e) { next(e); }
  },
};
