import { profileService } from "../user/profile.service.js";
import { AppError } from "../../middleware/errorMiddleware.js";
export const profileController = {
    /**
     * GET /profile
     */
    async get(req, res) {
        const userId = req.user?.userId;
        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }
        const profile = await profileService.get(userId);
        return res.json({
            status: "success",
            message: "Profile fetched successfully",
            data: profile,
        });
    },
    /**
     * PATCH /profile
     */
    async update(req, res) {
        const userId = req.user?.userId;
        if (!userId) {
            throw new AppError("Unauthorized", 401);
        }
        const allowedFields = [
            "name",
            "avatarUrl",
            "notificationsEnabled",
            "emailReceipts",
            "uiVersion",
            "email",
        ];
        const updateData = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                updateData[key] = req.body[key];
            }
        }
        const profile = await profileService.update(userId, updateData);
        if (!profile) {
            throw new AppError("Profile not found", 404);
        }
        return res.json({
            status: "success",
            message: "Profile updated successfully",
            data: profile,
        });
    },
};
//# sourceMappingURL=profile.controller.js.map