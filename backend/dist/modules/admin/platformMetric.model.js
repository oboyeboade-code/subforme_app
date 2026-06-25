import mongoose, { Schema } from "mongoose";
const PlatformMetricSchema = new Schema({
    weekIdentifier: { type: String, required: true, unique: true },
    topProviders: [{ type: String }],
    mostOrderedServices: [{ type: String }],
    totalRevenue: { type: Number },
    activeUsersCount: { type: Number },
    systemHealthStatus: { type: String },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });
export const PlatformMetricModel = mongoose.model("PlatformMetric", PlatformMetricSchema);
//# sourceMappingURL=platformMetric.model.js.map