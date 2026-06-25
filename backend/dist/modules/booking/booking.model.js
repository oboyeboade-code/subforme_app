import mongoose, { Schema } from "mongoose";
const BookingSchema = new Schema({
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
}, { timestamps: true });
export const BookingModel = mongoose.model("Booking", BookingSchema);
//# sourceMappingURL=booking.model.js.map