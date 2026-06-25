import { Request, Response, NextFunction } from "express";
import { subscriptionService } from "./subscription.service.js";

export const subscriptionController = {
  subscriptions: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const subscriptionsData = await subscriptionService.subscriptions(req.user!.userId);
      res.status(200).json({
        status: "success",
        message: "Subscriptions fetched successfully",
        data: { subscriptions: subscriptionsData },
      });
    } catch (error) {
      next(error);
    }
  },
};
