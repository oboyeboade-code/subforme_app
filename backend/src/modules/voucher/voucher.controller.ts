import { Request, Response, NextFunction } from "express";
import { AppError } from "../../middleware/errorMiddleware.js";
import { voucherService } from "./voucher.service.js";

export const voucherController = {
  buyWithCoins: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { valueNaira } = req.body;
      if (!valueNaira || valueNaira <= 0) throw new AppError("valueNaira is required and must be positive", 400);
      const data = await voucherService.buyWithCoins(req.user!.userId, valueNaira);
      res.status(201).json({ status: "success", message: "Voucher purchased successfully", data });
    } catch (error) {
      next(error);
    }
  },

  validateForCheckout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, cartTotal } = req.body;
      if (!code) throw new AppError("Voucher code is required", 400);
      if (cartTotal == null || cartTotal < 0) throw new AppError("cartTotal is required", 400);
      const data = await voucherService.validateForCheckout(req.user!.userId, code, cartTotal);
      res.status(200).json({ status: "success", message: "Voucher is valid", data });
    } catch (error) {
      next(error);
    }
  },

  consumeAfterPayment: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, code, orderId } = req.body;
      if (!userId || !code || !orderId) throw new AppError("userId, code, and orderId are required", 400);
      const voucher = await voucherService.consumeAfterPayment(userId, code, orderId);
      res.status(200).json({ status: "success", message: "Voucher consumed", data: { voucher } });
    } catch (error) {
      next(error);
    }
  },

  listUserVouchers: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vouchers = await voucherService.listUserVouchers(req.user!.userId);
      res.status(200).json({ status: "success", data: { vouchers } });
    } catch (error) {
      next(error);
    }
  },

  getMarketplaceVouchers: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vouchers = await voucherService.getMarketplaceVouchers();
      res.status(200).json({ status: "success", data: { vouchers } });
    } catch (error) {
      next(error);
    }
  },
};
