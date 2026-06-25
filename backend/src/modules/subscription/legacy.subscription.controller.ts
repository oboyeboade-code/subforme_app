import { Request, Response, NextFunction } from "express";
import { SubscriptionService } from "../subscription/legacy.subscription.service.js";
import { ok } from "../../utils/respond.js";
import { AppError } from "../../middleware/errorMiddleware.js";

export const SubscriptionController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError("Unauthorized", 401);
      const sub = await SubscriptionService.create({ ...req.body, user_id: userId });
      ok(res, sub, "Subscription created", 201);
    } catch (e) { next(e); }
  },

  async mySubs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new AppError("Unauthorized", 401);
      const subs = await SubscriptionService.findActiveByUser(userId);
      ok(res, subs, "Subscriptions fetched");
    } catch (e) { next(e); }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await SubscriptionService.cancel(id);
      ok(res, updated, "Subscription cancelled");
    } catch (e) { next(e); }
  },
};
