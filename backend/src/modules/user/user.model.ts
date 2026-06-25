import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole =
  | "super-admin"
  | "admin"
  | "customer"
  | "vendor";

export interface IBaseUser extends Document {
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  emailVerified: boolean;
  lastSignInAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const baseUserSchema = new Schema<IBaseUser>(
  {
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
  },
  {
    timestamps: true,
    discriminatorKey: "role",
  }
);

baseUserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;

  this.password = await bcrypt.hash(this.password, 10);
});

export const UserModel = mongoose.model<IBaseUser>("User", baseUserSchema);

/* ADMIN DISCRIMINATOR */
export interface IAdmin extends IBaseUser {
  createdBy?: mongoose.Types.ObjectId;
  permissions?: string[];
  region?: string;
  listingReviewCount?: number;
}

const AdminSchema = new Schema<IAdmin>({
  createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  permissions: [{ type: String }],
  region: { type: String },
  listingReviewCount: { type: Number, default: 0 },
});

export const AdminModel = UserModel.discriminator<IAdmin>(
  "admin",
  AdminSchema
);

/* CUSTOMER DISCRIMINATOR */
export interface ICartItem {
  serviceId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  priceNaira: number;
  quantity: number;
  addedAt: Date;
}

export interface IWishlistItem {
  serviceId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  addedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
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
  },
  { _id: false }
);

const WishlistItemSchema = new Schema<IWishlistItem>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

export interface ICustomer extends IBaseUser {
  wishlist?: IWishlistItem[];
  cartItems?: ICartItem[];
  coins?: number;
  savedVendors?: mongoose.Types.ObjectId[];
  totalSpentNaira?: number;
  referralCode?: string;
  preferredPaymentChannel?: string;
  subscriptions?: mongoose.Types.ObjectId[];
}

const CustomerSchema = new Schema<ICustomer>(
  {
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
  },
  { timestamps: true }
);

export const CustomerModel = UserModel.discriminator<ICustomer>(
  "customer",
  CustomerSchema
);

/* VENDOR DISCRIMINATOR */
export interface IVendor extends IBaseUser {
  vendorBusinessIds?: mongoose.Types.ObjectId[];
  isOwner?: boolean;
  totalRedemptions?: number;
  lastActiveAt?: Date;
}

const VendorSchema = new Schema<IVendor>({
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

export const VendorModel = UserModel.discriminator<IVendor>(
  "vendor",
  VendorSchema
);

/* SUPER ADMIN DISCRIMINATOR */
export interface ISuperAdmin extends IBaseUser {
  isGodMode?: boolean;
  canManageAdmins?: boolean;
  canAccessFinancials?: boolean;
  canManageSettings?: boolean;
  canPerformBackups?: boolean;
  twoFactorSecret?: string;
  managedAdmins?: mongoose.Types.ObjectId[];
}

const SuperAdminSchema = new Schema<ISuperAdmin>({
  isGodMode: { type: Boolean, default: false },
  canManageAdmins: { type: Boolean, default: false },
  canAccessFinancials: { type: Boolean, default: false },
  canManageSettings: { type: Boolean, default: false },
  canPerformBackups: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  managedAdmins: [{ type: Schema.Types.ObjectId, ref: "Admin" }],
});

export const SuperAdminModel = UserModel.discriminator<ISuperAdmin>(
  "super-admin",
  SuperAdminSchema
);
