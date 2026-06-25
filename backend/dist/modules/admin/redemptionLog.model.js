import mongoose, { Schema } from "mongoose";
const RedemptionLogSchema = new Schema({
    serviceCodeId: { type: Schema.Types.ObjectId, ref: "ServiceCode", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    ipAddress: { type: String },
    deviceInfo: { type: String },
    location: { type: String },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });
export const RedemptionLogModel = mongoose.model("RedemptionLog", RedemptionLogSchema);
//# sourceMappingURL=redemptionLog.model.js.map