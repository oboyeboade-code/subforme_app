import mongoose, { Schema, Document } from "mongoose";

export interface IPlatformMetric extends Document {
  weekIdentifier: string;
  topProviders?: string[];
  mostOrderedServices?: string[];
  totalRevenue?: number;
  activeUsersCount?: number;
  systemHealthStatus?: string;
  lastUpdatedBy?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformMetricSchema = new Schema<IPlatformMetric>(
  {
    weekIdentifier: { type: String, required: true, unique: true },
    topProviders: [{ type: String }],
    mostOrderedServices: [{ type: String }],
    totalRevenue: { type: Number },
    activeUsersCount: { type: Number },
    systemHealthStatus: { type: String },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const PlatformMetricModel = mongoose.model<IPlatformMetric>(
  "PlatformMetric",
  PlatformMetricSchema
);
