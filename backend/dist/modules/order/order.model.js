import mongoose, { Schema } from "mongoose";
const OrderSchema = new Schema({
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
}, { timestamps: true });
export const OrderModel = mongoose.model("Order", OrderSchema);
//# sourceMappingURL=order.model.js.map