import { ListingRequestModel } from "../_shared/listing.model.js";
export const ListingRequestService = {
    async createRequest(data) {
        return ListingRequestModel.create({
            ...data,
            status: "pending",
        });
    },
    async getAllRequests() {
        return ListingRequestModel.find()
            .populate("userId", "email role")
            .populate("vendorBusinessId", "businessName slug")
            .sort({ createdAt: -1 });
    },
    async getUserRequests(userId) {
        return ListingRequestModel.find({ userId })
            .sort({ createdAt: -1 });
    },
};
//# sourceMappingURL=listingRequest.service.js.map