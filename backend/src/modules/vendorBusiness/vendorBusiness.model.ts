import mongoose, { Schema, Document } from "mongoose";

export interface IVendorBusiness extends Document {
  ownerUserId: mongoose.Types.ObjectId;
  serviceIds?: mongoose.Types.ObjectId[];
  businessName: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  category: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  operatingHours?: string;
  bankAccountDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  status: "pending" | "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

const VendorBusinessSchema = new Schema<IVendorBusiness>(
  {
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceIds: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    businessName: { type: String, required: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logoUrl: { type: String, default: null },
    description: { type: String, default: null },
    category: { type: String, required: true },
    address: { type: String },
    contactPhone: { type: String },
    contactEmail: { type: String },
    operatingHours: { type: String },
    bankAccountDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      accountName: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const VendorBusinessModel = mongoose.model<IVendorBusiness>(
  "VendorBusiness",
  VendorBusinessSchema
);
