import { Request, Response, NextFunction } from "express";
import { AppError } from "../../middleware/errorMiddleware.js";
import { wishlistService } from "./wishlist.service.js";

export interface Params {
  serviceId: string;
}

// Wishlist is stored on the customer document (see user.service.ts).
export const wishlistController = {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const wishlist = await wishlistService.wishlist(req.user!.userId);
      res.status(200).json({ status: "success", message: "Wishlist fetched successfully", data: { wishlist } });
    } catch (e) { next(e); }
  },

  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.body;
      if (!serviceId) throw new AppError("serviceId is required", 400);
      const wishlist = await wishlistService.addToWishlist(req.user!.userId, serviceId);
      res.status(200).json({ status: "success", message: "Added to wishlist", data: { wishlist } });
    } catch (e) { next(e); }
  },

  async remove(req: Request<Params>, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const wishlist = await wishlistService.removeFromWishlist(req.user!.userId, serviceId);
      res.status(200).json({ status: "success", message: "Removed from wishlist", data: { wishlist } });
    } catch (e) { next(e); }
  },

  async clear(req: Request, res: Response, next: NextFunction) {
    try {
      const wishlist = await wishlistService.clearWishlist(req.user!.userId);
      res.status(200).json({ status: "success", message: "Wishlist cleared", data: { wishlist } });
    } catch (e) { next(e); }
  },
};
