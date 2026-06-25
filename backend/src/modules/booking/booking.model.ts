import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  serviceCodeIds?: mongoose.Types.ObjectId[];
  quantity?: number;
  totalPriceNaira?: number;
  status: "pending" | "confirmed" | "cancelled" | "no_show" | "completed";
  bookedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    serviceCodeIds: [{ type: Schema.Types.ObjectId, ref: "ServiceCode" }],
    quantity: { type: Number, min: 1 },
    totalPriceNaira: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "no_show", "completed"],
      default: "pending",
    },
    bookedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);
