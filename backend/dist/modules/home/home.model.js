import mongoose, { Schema } from "mongoose";
const PlatformMetricSchema = new Schema({
    weekIdentifier: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    // Updated to store the full TopProvider objects
    topProviders: [
        {
            id: String,
            providerName: String,
            services: [String],
            logoUrl: String,
        },
    ],
    mostOrderedServices: [
        {
            type: String,
        },
    ],
    totalRevenue: {
        type: Number,
        default: 0,
        min: 0,
    },
    activeUsersCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    systemHealthStatus: {
        type: String,
        enum: ["healthy", "degraded", "down"],
        default: "healthy",
    },
    metadata: {
        type: Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
});
PlatformMetricSchema.index({ createdAt: -1 });
export const PlatformMetricModel = mongoose.model("PlatformMetric", PlatformMetricSchema);
//# sourceMappingURL=home.model.js.map