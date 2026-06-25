import mongoose, { Schema, Document } from "mongoose";

export interface IServiceCode extends Document {
  userId: mongoose.Types.ObjectId;
  vendorBusinessId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  auth_code: string;
  serv_code: string;
  purchasePrice?: number;
  status: "active" | "used" | "expired" | "voided";
  issuedAt: Date;
  expiresAt?: Date;
  redeemedAt?: Date;
  redeemedBy?: mongoose.Types.ObjectId;
  isVoided: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceCodeSchema = new Schema<IServiceCode>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vendorBusinessId: { type: Schema.Types.ObjectId, ref: "VendorBusiness", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    auth_code: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
      length: 8,
      match: /^[A-Z0-9]{8}$/,
    },
    serv_code: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
      length: 8,
      match: /^[A-Z0-9]{8}$/,
    },
    purchasePrice: { type: Number },
    status: {
      type: String,
      enum: ["active", "used", "expired", "voided"],
      default: "active",
    },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    redeemedAt: { type: Date },
    redeemedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isVoided: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ServiceCodeModel = mongoose.model<IServiceCode>(
  "ServiceCode",
  ServiceCodeSchema
);
