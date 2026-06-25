import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
const baseUserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: { type: String, default: null },
    password: {
        type: String,
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ["super-admin", "admin", "customer", "vendor"],
        required: true,
    },
    emailVerified: { type: Boolean, default: false },
    lastSignInAt: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
}, {
    timestamps: true,
    discriminatorKey: "role",
});
baseUserSchema.pre("save", async function () {
    if (!this.isModified("password") || !this.password)
        return;
    this.password = await bcrypt.hash(this.password, 10);
});
export const UserModel = mongoose.model("User", baseUserSchema);
const AdminSchema = new Schema({
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    permissions: [{ type: String }],
    region: { type: String },
    listingReviewCount: { type: Number, default: 0 },
});
export const AdminModel = UserModel.discriminator("admin", AdminSchema);
const CartItemSchema = new Schema({
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: "Service",
        required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    priceNaira: { type: Number, required: true },
    quantity: { type: Number, default: 1, min: 1 },
    addedAt: { type: Date, default: Date.now },
}, { _id: false });
const WishlistItemSchema = new Schema({
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: "Service",
        required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
}, { _id: false });
const CustomerSchema = new Schema({
    wishlist: [WishlistItemSchema],
    cartItems: [CartItemSchema],
    coins: { type: Number, default: 0, min: 0 },
    savedVendors: [{ type: Schema.Types.ObjectId, ref: "VendorBusiness" }],
    totalSpentNaira: { type: Number, default: 0 },
    referralCode: { type: String },
    preferredPaymentChannel: { type: String },
    subscriptions: [
        {
            type: Schema.Types.ObjectId,
            ref: "ServiceCode",
        },
    ],
}, { timestamps: true });
export const CustomerModel = UserModel.discriminator("customer", CustomerSchema);
const VendorSchema = new Schema({
    vendorBusinessIds: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "VendorBusiness",
            },
        ],
        default: [],
    },
    isOwner: { type: Boolean, default: false },
    totalRedemptions: { type: Number, default: 0 },
    lastActiveAt: { type: Date },
});
export const VendorModel = UserModel.discriminator("vendor", VendorSchema);
const SuperAdminSchema = new Schema({
    isGodMode: { type: Boolean, default: false },
    canManageAdmins: { type: Boolean, default: false },
    canAccessFinancials: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false },
    canPerformBackups: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    managedAdmins: [{ type: Schema.Types.ObjectId, ref: "Admin" }],
});
export const SuperAdminModel = UserModel.discriminator("super-admin", SuperAdminSchema);
//# sourceMappingURL=user.model.js.map