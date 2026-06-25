import { OrderModel } from "../_shared/order.model.js";
export const orderService = {
    createFromMetadata: async (metadata, reference) => {
        return await OrderModel.create({
            ref: reference, // ✅ correct field (NOT _id)
            userId: metadata.userId,
            bookingIds: metadata.items, // ✅ FIX: map items → bookingIds
            subtotal: metadata.cartTotal,
            discount: metadata.discountApplied,
            total: metadata.cartTotal - metadata.discountApplied,
            totalPaid: metadata.cartTotal - metadata.discountApplied, // ✅ REQUIRED FIELD
            status: "paid",
            voucherCode: metadata.voucherCode,
            paidAt: new Date(),
        });
    }
};
//# sourceMappingURL=order.service.js.map