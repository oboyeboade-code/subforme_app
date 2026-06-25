import { Request, Response, NextFunction } from "express";
import { AppError } from "../../middleware/errorMiddleware.js";
import { cartService } from "./cart.service.js";

export interface Params {
  serviceId: string;
}
// Cart is stored on the customer document (see user.service.ts). This controller
// is a thin re-export of the relevant user.controller methods, scoped to /api/cart.
export const cartController = {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.cart(req.user!.userId);
      res.status(200).json({ status: "success", message: "Cart fetched successfully", data: { cart } });
    } catch (e) { next(e); }
  },

  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId, quantity } = req.body;
      if (!serviceId) throw new AppError("serviceId is required", 400);
      const cart = await cartService.addToCart(req.user!.userId, serviceId, quantity);
      res.status(200).json({ status: "success", message: "Added to cart", data: { cart } });
    } catch (e) { next(e); }
  },

  async update(req: Request<Params>, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const { quantity } = req.body;
      const cart = await cartService.updateCartItemQuantity(req.user!.userId, serviceId, quantity);
      res.status(200).json({ status: "success", message: "Cart updated", data: { cart } });
    } catch (e) { next(e); }
  },

  async remove(req: Request<Params>, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const cart = await cartService.removeFromCart(req.user!.userId, serviceId);
      res.status(200).json({ status: "success", message: "Removed from cart", data: { cart } });
    } catch (e) { next(e); }
  },

  async clear(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.clearCart(req.user!.userId);
      res.status(200).json({ status: "success", message: "Cart cleared", data: { cart } });
    } catch (e) { next(e); }
  },
};
