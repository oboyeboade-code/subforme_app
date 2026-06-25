import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  ref: string;
  userId: mongoose.Types.ObjectId;
  bookingIds?: mongoose.Types.ObjectId[];
  paymentId?: mongoose.Types.ObjectId;
  currency?: string;
  subtotal: number;
  discount?: number;
  total: number;
  totalPaid: number;
  status: "pending" | "paid" | "failed";
  voucherCode?: string;
  voucherDiscount?: number;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    ref: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookingIds: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    currency: { type: String, default: "NGN" },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    totalPaid: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    voucherCode: { type: String },
    voucherDiscount: { type: Number, default: 0 },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
