import mongoose from "mongoose";
import { AppError } from "../../middleware/errorMiddleware.js";
import { CustomerModel } from "../user/user.model.js";
export const subscriptionService = {
    subscriptions: async (userId) => {
        if (!userId)
            throw new AppError("Unauthorized", 401);
        if (!mongoose.Types.ObjectId.isValid(userId))
            throw new AppError("Invalid user id", 400);
        const customer = await CustomerModel.findById(userId)
            .select("subscriptions")
            .populate({
            path: "subscriptions",
            select: "auth_code serv_code status serviceId",
            populate: {
                path: "serviceId",
                model: "Service",
                select: "name _id",
            },
        })
            .lean();
        if (!customer)
            throw new AppError("Customer not found", 404);
        const subscriptions = ((customer.subscriptions) || []).map((sub) => ({
            _id: sub._id,
            auth_code: sub.auth_code,
            serv_code: sub.serv_code,
            status: sub.status,
            serviceName: sub.serviceId?.name || "Unknown Service",
            serviceId: sub.serviceId?._id?.toString() ?? null,
        }));
        return subscriptions;
    },
};
//# sourceMappingURL=subscription.service.js.map