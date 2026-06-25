import { ServiceModel } from "./service.model.js";
export const serviceService = {
    allServices: async () => {
        const services = await ServiceModel.find({ isActive: true })
            .populate({
            path: "vendorBusinessId",
            select: "businessName",
            model: "VendorBusiness",
        })
            .sort({ createdAt: -1 })
            .lean();
        return services;
    },
};
//# sourceMappingURL=service.service.js.map