import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  vendorBusinessId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  category: string;
  tags?: string[];
  image?: string;
  gallery?: string[];
  unitName?: string;
  priceNaira: number;
  originalPriceNaira?: number;
  discountValue?: number;
  minQuantity?: number;
  maxQuantity?: number;
  terms?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    vendorBusinessId: {
      type: Schema.Types.ObjectId,
      ref: "VendorBusiness",
      required: true,
      index: true,
    },
    name: { type: String, required: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: null },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, index: true }],
    image: { type: String },
    gallery: [{ type: String }],
    unitName: { type: String },
    priceNaira: { type: Number, required: true, min: 0 },
    originalPriceNaira: { type: Number, min: 0 },
    discountValue: { type: Number, min: 0 },
    minQuantity: { type: Number, min: 1, default: 1 },
    maxQuantity: { type: Number, min: 1 },
    terms: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ServiceModel = mongoose.model<IService>("Service", ServiceSchema);
