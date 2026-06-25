import mongoose, { Schema } from "mongoose";
const ServiceSchema = new Schema({
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
}, { timestamps: true });
export const ServiceModel = mongoose.model("Service", ServiceSchema);
//# sourceMappingURL=service.model.js.map