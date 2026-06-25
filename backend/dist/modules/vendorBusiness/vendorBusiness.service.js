import { VendorBusinessModel, ServiceModel, OfferModel, ServiceCodeModel, } from "../_shared/user.model.js";
export const VendorService = {
    async getVendorDetails(vendorBusinessId) {
        const vendor = await VendorBusinessModel.findById(vendorBusinessId).lean();
        if (!vendor)
            throw new Error("Vendor not found");
        return vendor;
    },
    async getVendorServices(vendorBusinessId) {
        return ServiceModel.find({ vendorBusinessId, isActive: true }).lean();
    },
    async getVendorOffers(vendorBusinessId) {
        const services = await ServiceModel.find({ vendorBusinessId }).select("_id").lean();
        return OfferModel.find({
            serviceId: { $in: services.map((s) => s._id) },
            isActive: true,
        }).lean();
    },
    async getVendorServiceCodes(vendorBusinessId) {
        return ServiceCodeModel.find({ vendorBusinessId })
            .populate("userId", "email role")
            .populate("serviceId", "name priceNaira image")
            .lean();
    },
    async getVendorFull(vendorBusinessId) {
        const [vendor, services, offers, serviceCodes] = await Promise.all([
            this.getVendorDetails(vendorBusinessId),
            this.getVendorServices(vendorBusinessId),
            this.getVendorOffers(vendorBusinessId),
            this.getVendorServiceCodes(vendorBusinessId),
        ]);
        return { vendor, services, offers, serviceCodes };
    },
    /**
     * Earnings rollup — counts redeemed codes per service.
     * Simple aggregation suitable for the vendor portal dashboard.
     */
    async getEarnings(vendorBusinessId) {
        const [services, codes] = await Promise.all([
            ServiceModel.find({ vendorBusinessId }).lean(),
            ServiceCodeModel.find({ vendorBusinessId }).lean(),
        ]);
        const perService = services.map((s) => {
            const codesForService = codes.filter((c) => c.serviceId.toString() === s._id.toString());
            const used = codesForService.filter((c) => c.status === "used").length;
            const active = codesForService.filter((c) => c.status === "active").length;
            const grossNaira = used * (s.priceNaira ?? 0);
            return {
                serviceId: s._id,
                name: s.name,
                priceNaira: s.priceNaira,
                codesIssued: codesForService.length,
                codesUsed: used,
                codesActive: active,
                grossNaira,
            };
        });
        const totals = perService.reduce((acc, s) => {
            acc.grossNaira += s.grossNaira;
            acc.codesIssued += s.codesIssued;
            acc.codesUsed += s.codesUsed;
            acc.codesActive += s.codesActive;
            return acc;
        }, { grossNaira: 0, codesIssued: 0, codesUsed: 0, codesActive: 0 });
        return { totals, perService };
    },
};
//# sourceMappingURL=vendorBusiness.service.js.map