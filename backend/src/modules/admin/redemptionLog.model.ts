import mongoose, { Schema, Document } from "mongoose";

export interface IRedemptionLog extends Document {
  serviceCodeId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  ipAddress?: string;
  deviceInfo?: string;
  location?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RedemptionLogSchema = new Schema<IRedemptionLog>(
  {
    serviceCodeId: { type: Schema.Types.ObjectId, ref: "ServiceCode", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    ipAddress: { type: String },
    deviceInfo: { type: String },
    location: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const RedemptionLogModel = mongoose.model<IRedemptionLog>(
  "RedemptionLog",
  RedemptionLogSchema
);
