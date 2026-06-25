import express, { Request, Response, NextFunction } from "express";
import { OrderModel } from "../_shared/order.model.js";
import { protect } from "../../middleware/protect.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../middleware/errorMiddleware.js";

const router = express.Router();

router.get(
  "/by-ref/:ref",
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await OrderModel.findOne({
        ref: req.params.ref,
        userId: req.user!.userId,
      }).lean();

      if (!order) throw new AppError("Order not found", 404);
      ok(res, order, "Order fetched");
    } catch (e) {
      next(e);
    }
  }
);

export default router;
