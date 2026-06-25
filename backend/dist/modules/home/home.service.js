import { BookingModel } from "../../modules/booking/booking.model.js";
import { VendorBusinessModel } from "../../modules/vendorBusiness/vendorBusiness.model.js";
import { ServiceModel } from "../../modules/service/service.model.js";
import { UserModel } from "../../modules/user/user.model.js";
import { PlatformMetricModel } from "./home.model.js";
export const homeService = {
    /**
     * FETCH LATEST METRICS
     */
    async getPlatformMetrics() {
        const cached = await PlatformMetricModel.findOne()
            .sort({ createdAt: -1 })
            .lean();
        if (cached) {
            return cached;
        }
        return this.syncPlatformMetrics();
    },
    /**
     * COMPUTE & SAVE (CRON JOB)
     */
    async syncPlatformMetrics() {
        const metrics = await this.computeMetricsLive();
        const updated = await PlatformMetricModel.findOneAndUpdate({ weekIdentifier: metrics.weekIdentifier }, { $set: metrics }, { upsert: true, new: true }).lean();
        return updated;
    },
    /**
     * INTERNAL: LIVE COMPUTATION LOGIC
     */
    async computeMetricsLive() {
        const weekIdentifier = getCurrentWeek();
        const [totalRevenueAgg, totalBookings, activeUsersCount, topProviders, mostOrderedServicesAgg,] = await Promise.all([
            BookingModel.aggregate([
                { $group: { _id: null, totalRevenue: { $sum: "$totalPriceNaira" } } },
            ]),
            BookingModel.countDocuments(),
            UserModel.countDocuments({ role: "customer" }),
            this.getTopProviders(), // This now returns the full complex object
            BookingModel.aggregate([
                { $group: { _id: "$serviceId", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),
        ]);
        // Enrich services for metadata
        const serviceIds = mostOrderedServicesAgg.map((s) => s._id);
        const services = await ServiceModel.find({ _id: { $in: serviceIds } });
        const serviceMap = new Map(services.map((s) => [s._id.toString(), s]));
        const detailedServices = mostOrderedServicesAgg
            .map((s) => {
            const service = serviceMap.get(s._id.toString());
            return service ? { id: service._id.toString(), name: service.name, totalOrders: s.count } : null;
        })
            .filter(Boolean);
        return {
            weekIdentifier,
            totalRevenue: totalRevenueAgg?.[0]?.totalRevenue || 0,
            activeUsersCount,
            systemHealthStatus: "healthy",
            topProviders,
            mostOrderedServices: detailedServices.map(s => s.name),
            metadata: {
                totalBookings,
                detailedServices: detailedServices,
            },
        };
    },
    /**
     * TOP PROVIDERS
     * Logic: Group by vendor, then within each vendor, identify the services that were booked.
     */
    async getTopProviders() {
        const topAgg = await BookingModel.aggregate([
            {
                $group: {
                    _id: "$vendorId",
                    totalBookings: { $sum: 1 },
                    // Collect unique service IDs that were booked for this vendor
                    qualifyingServiceIds: { $addToSet: "$serviceId" },
                },
            },
            { $sort: { totalBookings: -1 } },
            { $limit: 10 },
        ]);
        const vendorIds = topAgg.map((t) => t._id);
        const allQualifyingServiceIds = topAgg.flatMap((t) => t.qualifyingServiceIds);
        const [vendors, services] = await Promise.all([
            VendorBusinessModel.find({ _id: { $in: vendorIds } }),
            ServiceModel.find({ _id: { $in: allQualifyingServiceIds } }),
        ]);
        const vendorMap = new Map(vendors.map((v) => [v._id.toString(), v]));
        const serviceMap = new Map(services.map((s) => [s._id.toString(), s.name]));
        return topAgg
            .map((t) => {
            const vendor = vendorMap.get(t._id.toString());
            if (!vendor)
                return null;
            // Map service IDs to their names
            const serviceNames = t.qualifyingServiceIds
                .map((id) => serviceMap.get(id.toString()))
                .filter(Boolean);
            return {
                id: vendor._id.toString(),
                providerName: vendor.businessName,
                services: serviceNames,
                logoUrl: vendor.logoUrl,
            };
        })
            .filter(Boolean);
    },
    /**
     * CATEGORIES
     */
    async getCategories() {
        const categories = await ServiceModel.distinct("category");
        return categories.map((c) => ({ name: c }));
    },
};
/**
 * Helper: Get current week identifier
 */
function getCurrentWeek() {
    const now = new Date();
    const year = now.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (now.getTime() - firstDayOfYear.getTime()) / 86400000;
    const week = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-W${week}`;
}
//# sourceMappingURL=home.service.js.map