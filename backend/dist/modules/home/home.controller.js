import { homeService } from "./home.service.js";
export const homeController = {
    async getTopProviders(req, res, next) {
        try {
            const topProviders = await homeService.getTopProviders();
            res.status(200).json({
                status: "success",
                message: "Top providers fetched successfully",
                data: topProviders,
            });
        }
        catch (e) {
            next(e);
        }
    },
    async getCategories(req, res, next) {
        try {
            const categories = await homeService.getCategories();
            res.status(200).json({
                status: "success",
                message: "Categories fetched successfully",
                data: categories,
            });
        }
        catch (e) {
            next(e);
        }
    },
    async getPlatformMetrics(req, res, next) {
        try {
            const platformMetrics = await homeService.getPlatformMetrics();
            res.status(200).json({
                status: "success",
                message: "Platform metrics fetched successfully",
                data: platformMetrics,
            });
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=home.controller.js.map