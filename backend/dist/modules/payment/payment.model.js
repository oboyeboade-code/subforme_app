import mongoose, { Schema } from "mongoose";
const PaymentSchema = new Schema({
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
}, { timestamps: true });
export const PaymentModel = mongoose.model("Payment", PaymentSchema);
//# sourceMappingURL=payment.model.js.map