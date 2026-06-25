// services/admin.service.ts
import { AdminModel, ProfileModel, ServiceCodeModel, ServiceModel, VendorBusinessModel, } from "../_shared/user.model.js";
export const AdminService = {
    /* OVERVIEW */
    async overview() {
        const [providersCount, servicesCount, codesCount, activeProvidersCount,] = await Promise.all([
            VendorBusinessModel.countDocuments(),
            ServiceModel.countDocuments(),
            ServiceCodeModel.countDocuments(),
            VendorBusinessModel.countDocuments({
                status: "active",
            }),
        ]);
        return {
            providersCount,
            servicesCount,
            codesCount,
            activeProvidersCount,
            systemStatus: "healthy",
        };
    },
    /* VENDORS */
    async getVendors() {
        return VendorBusinessModel.find()
            .sort({ createdAt: -1 })
            .lean();
    },
    async getVendorById(id) {
        const vendor = await VendorBusinessModel.findById(id).lean();
        const services = await ServiceModel.find({
            vendorBusinessId: id,
        }).lean();
        const serviceCodes = await ServiceCodeModel.find({
            vendorBusinessId: id,
        })
            .select("-code")
            .populate("serviceId")
            .populate("userId", "-password")
            .lean();
        return {
            vendor,
            services,
            serviceCodes,
        };
    },
    /* SERVICES */
    async getServices() {
        return ServiceModel.find()
            // .populate("vendorBusinessId", "businessName")
            .populate("vendorBusinessId")
            .sort({ createdAt: -1 })
            .lean();
    },
    /* SERVICE CODES */
    async getServiceCodes() {
        return ServiceCodeModel.find()
            .populate("serviceId")
            // .populate("userId", "-password")
            .populate("userId")
            .sort({ createdAt: -1 })
            .lean();
    },
    /* SETTINGS */
    async settings() {
        const [providers, services, admins] = await Promise.all([
            VendorBusinessModel.find().lean(),
            ServiceModel.find()
                .populate("vendorBusinessId", "businessName")
                .lean(),
            AdminModel.find()
                .select("-password")
                .lean(),
        ]);
        return {
            providers,
            services,
            admins,
        };
    },
    /* PROVIDERS */
    async createProvider(data) {
        return VendorBusinessModel.create(data);
    },
    async updateProvider(id, data) {
        return VendorBusinessModel.findByIdAndUpdate(id, data, {
            new: true,
        });
    },
    async deleteProvider(id) {
        return VendorBusinessModel.findByIdAndDelete(id);
    },
    /* SERVICES */
    async createService(data) {
        return ServiceModel.create(data);
    },
    async updateService(id, data) {
        return ServiceModel.findByIdAndUpdate(id, data, {
            new: true,
        });
    },
    async deleteService(id) {
        return ServiceModel.findByIdAndDelete(id);
    },
    /* ADMINS */
    async getAdmins() {
        const admins = await AdminModel.find()
            .select("-password")
            .lean();
        const adminIds = admins.map((a) => a._id);
        // Profile uses `_id` (shared PK with User), NOT `userId`
        const profiles = await ProfileModel.find({
            _id: { $in: adminIds },
        }).lean();
        return admins.map((admin) => {
            const profile = profiles.find((p) => p._id.toString() === admin._id.toString());
            return {
                ...admin,
                profile,
            };
        });
    },
    async createAdmin(data) {
        return AdminModel.create({
            ...data,
            role: "admin",
        });
    },
    async updateAdmin(id, data) {
        return AdminModel.findByIdAndUpdate(id, data, {
            new: true,
        }).select("-password");
    },
    async deleteAdmin(id) {
        return AdminModel.findByIdAndDelete(id);
    },
    /* REFRESH CODES */
    async refreshCodes() {
        const now = new Date();
        await ServiceCodeModel.updateMany({
            expiresAt: { $lt: now },
            status: "active",
        }, {
            status: "expired",
        });
        return {
            success: true,
            refreshedAt: now,
        };
    },
};
//# sourceMappingURL=admin.service.js.map