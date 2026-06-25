import { subscriptionService } from "./subscription.service.js";
export const subscriptionController = {
    subscriptions: async (req, res, next) => {
        try {
            const subscriptionsData = await subscriptionService.subscriptions(req.user.userId);
            res.status(200).json({
                status: "success",
                message: "Subscriptions fetched successfully",
                data: { subscriptions: subscriptionsData },
            });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=subscription.controller.js.map