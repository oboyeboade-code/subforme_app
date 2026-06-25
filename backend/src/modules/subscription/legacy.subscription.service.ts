import { Subscription } from "../_shared/subscription.model.js";

export const SubscriptionService = {
  async create(data: any) {
    return Subscription.create(data);
  },

  async findActiveByUser(user_id: string) {
    return Subscription.find({
      user_id,
      status: "active",
    }).populate("vendor_id");
  },

  async cancel(subscriptionId: string) {
    return Subscription.findByIdAndUpdate(
      subscriptionId,
      {
        status: "cancelled",
        expired_at: new Date(),
      },
      { new: true }
    );
  },
};