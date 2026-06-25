import { Subscription } from "../_shared/subscription.model.js";
export const SubscriptionService = {
    async create(data) {
        return Subscription.create(data);
    },
    async findActiveByUser(user_id) {
        return Subscription.find({
            user_id,
            status: "active",
        }).populate("vendor_id");
    },
    async cancel(subscriptionId) {
        return Subscription.findByIdAndUpdate(subscriptionId, {
            status: "cancelled",
            expired_at: new Date(),
        }, { new: true });
    },
};
//# sourceMappingURL=legacy.subscription.service.js.map