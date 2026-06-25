import mongoose, { Schema } from "mongoose";
const VendorBusinessSchema = new Schema({
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
}, { timestamps: true });
export const VendorBusinessModel = mongoose.model("VendorBusiness", VendorBusinessSchema);
//# sourceMappingURL=vendorBusiness.model.js.map