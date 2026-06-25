import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  bookingIds?: mongoose.Types.ObjectId[];
  transactionReference?: string;
  channel?: string;
  status: "pending" | "succeeded" | "failed";
  errorMessage?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    bookingIds: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
    transactionReference: { type: String },
    channel: { type: String },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },
    errorMessage: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export const PaymentModel = mongoose.model<IPayment>("Payment", PaymentSchema);
