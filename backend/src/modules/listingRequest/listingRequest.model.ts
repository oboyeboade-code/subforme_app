import mongoose, { Schema, Document } from "mongoose";

export interface IListingRequest extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  address?: string;
  serviceName: string;
  category: string;
  pricing: string;
  estCodesPerMonth?: number;
  operatingHours?: string;
  description?: string;
  redemptionInstructions?: string;
  payoutMethod?: string;
  payoutName?: string;
  bankName?: string;
  accountNumber?: string;
  mobileNumber?: string;
  walletAddress?: string;
  platformFee?: number;
  termsAccepted: boolean;
  rejectionReason?: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  uiVersion?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ListingRequestSchema = new Schema<IListingRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    businessName: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    website: { type: String },
    address: { type: String },
    serviceName: { type: String, required: true },
    category: { type: String, required: true },
    pricing: { type: String, required: true },
    estCodesPerMonth: { type: Number },
    operatingHours: { type: String },
    description: { type: String },
    redemptionInstructions: { type: String },
    payoutMethod: { type: String },
    payoutName: { type: String },
    bankName: { type: String },
    accountNumber: { type: String },
    mobileNumber: { type: String },
    walletAddress: { type: String },
    platformFee: { type: Number },
    termsAccepted: { type: Boolean, required: true },
    rejectionReason: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    uiVersion: { type: String },
  },
  { timestamps: true }
);

export const ListingRequestModel = mongoose.model<IListingRequest>(
  "ListingRequest",
  ListingRequestSchema
);
