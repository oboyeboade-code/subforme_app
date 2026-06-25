import mongoose, { Schema, Document } from "mongoose";

export interface IVoucher extends Document {
  userId?: mongoose.Types.ObjectId;
  code: string;
  valueNaira: number;
  type?: string;
  minOrderValue?: number;
  status: "active" | "used" | "expired";
  issuedAt: Date;
  expiresAt?: Date;
  usedAt?: Date;
  buyerUserIds?: mongoose.Types.ObjectId[];
  isMarketplace?: boolean;
  priceInCoins?: number;
  createdAt: Date;
  updatedAt: Date;
}

const VoucherSchema = new Schema<IVoucher>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      match: /^VCH-[A-Z0-9]{8}$/,
    },
    valueNaira: { type: Number, required: true, min: 1 },
    type: { type: String },
    minOrderValue: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ["active", "used", "expired"],
      default: "active",
    },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    usedAt: { type: Date, default: null },
    buyerUserIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isMarketplace: { type: Boolean, default: false },
    priceInCoins: { type: Number, min: 0 },
  },
  { timestamps: true }
);

export const VoucherModel = mongoose.model<IVoucher>("Voucher", VoucherSchema);
