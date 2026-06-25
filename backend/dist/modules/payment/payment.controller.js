import crypto from "crypto";
import mongoose from "mongoose";
import { voucherService } from "../voucher/voucher.service.js";
import { OrderModel } from "../_shared/order.model.js";
import { AppError } from "../../middleware/errorMiddleware.js";
import { ok } from "../../utils/respond.js";
/**
 * POST /api/payments/init
 */
export const initPaystack = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const { items = [], cartTotal, voucherCode, discountApplied = 0, email, callbackPath, } = req.body;
        if (!email)
            throw new AppError("Email is required", 400);
        if (typeof cartTotal !== "number" || cartTotal <= 0)
            throw new AppError("Invalid cart total", 400);
        const total = Math.max(0, cartTotal - (discountApplied || 0));
        const reference = `PSK-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
        await OrderModel.create({
            ref: reference,
            userId,
            bookingIds: items.map(i => new mongoose.Types.ObjectId(i.serviceId)),
            subtotal: cartTotal,
            discount: discountApplied,
            total,
            totalPaid: 0,
            status: "pending",
            voucherCode,
            voucherDiscount: discountApplied,
        });
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret)
            throw new AppError("Paystack not configured", 500);
        // Whitelist callback paths so a v3 user lands on /v3/app/paid and an
        // editorial user lands on /app/paid. Anything unexpected falls back
        // to /app/paid.
        const ALLOWED_CALLBACK_PATHS = new Set(["/app/paid", "/v3/app/paid"]);
        const safePath = callbackPath && ALLOWED_CALLBACK_PATHS.has(callbackPath)
            ? callbackPath
            : "/app/paid";
        const callbackUrl = `${process.env.CLIENT_URL || "http://localhost:8080"}${safePath}?ref=${reference}`;
        const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${secret}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                amount: Math.round(total * 100),
                reference,
                callback_url: callbackUrl,
                metadata: {
                    userId,
                    items,
                    cartTotal,
                    voucherCode,
                    discountApplied,
                },
            }),
        });
        const payload = await paystackRes.json();
        if (!paystackRes.ok || !payload?.status) {
            throw new AppError(payload?.message || "Paystack init failed", 502);
        }
        ok(res, {
            reference,
            authorization_url: payload.data.authorization_url,
            access_code: payload.data.access_code,
        }, "Paystack init successful");
    }
    catch (e) {
        next(e);
    }
};
/**
 * Shared: mark an order as paid (idempotent) and consume voucher.
 */
async function markOrderPaid(reference, amountKobo, metadata) {
    const existing = await OrderModel.findOne({ ref: reference });
    if (existing && existing.status === "paid")
        return existing;
    const update = {
        totalPaid: amountKobo / 100,
        status: "paid",
        paidAt: new Date(),
    };
    // Only set these if order didn't exist (webhook may arrive before init returns)
    if (!existing && metadata) {
        update.userId = metadata.userId;
        update.bookingIds = metadata.items?.map((i) => new mongoose.Types.ObjectId(i.serviceId));
        update.subtotal = metadata.cartTotal;
        update.voucherCode = metadata.voucherCode;
        update.voucherDiscount = metadata.discountApplied;
        update.ref = reference;
    }
    const order = await OrderModel.findOneAndUpdate({ ref: reference }, update, { upsert: true, new: true });
    const voucherCode = existing?.voucherCode || metadata?.voucherCode;
    const userId = existing?.userId || metadata?.userId;
    if (voucherCode && userId) {
        try {
            await voucherService.consumeAfterPayment(userId, voucherCode, reference);
        }
        catch (e) {
            console.error("Voucher consume failed:", e.message);
        }
    }
    return order;
}
/**
 * GET /api/payments/verify/:reference
 * Frontend calls this from the /app/paid page to confirm payment
 * synchronously via Paystack's verify API (works even when the webhook
 * can't reach localhost in dev).
 */
export const verifyPaystack = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            throw new AppError("Unauthorized", 401);
        const { reference } = req.params;
        if (!reference || Array.isArray(reference)) {
            throw new AppError("Invalid reference", 400);
        }
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret)
            throw new AppError("Paystack not configured", 500);
        // Already paid? Just return it.
        const existing = await OrderModel.findOne({ ref: reference });
        if (existing && existing.status === "paid") {
            ok(res, existing, "Already verified");
            return;
        }
        const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${secret}` } });
        const payload = await r.json();
        if (!r.ok || !payload?.status) {
            throw new AppError(payload?.message || "Verification failed", 502);
        }
        const data = payload.data;
        if (data.status !== "success") {
            ok(res, { status: data.status }, "Payment not successful");
            return;
        }
        const order = await markOrderPaid(reference, data.amount, data.metadata);
        ok(res, order, "Payment verified");
    }
    catch (e) {
        next(e);
    }
};
/**
 * POST /api/webhooks/paystack
 */
export const paystackWebhook = async (req, res) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
        res.sendStatus(500);
        return;
    }
    const hash = crypto
        .createHmac("sha512", secret)
        .update(req.body)
        .digest("hex");
    if (hash !== req.headers["x-paystack-signature"]) {
        console.warn("Invalid Paystack signature");
        res.sendStatus(401);
        return;
    }
    const event = JSON.parse(req.body.toString());
    if (event.event === "charge.success") {
        const { reference, metadata, amount } = event.data;
        await markOrderPaid(reference, amount, metadata);
    }
    res.sendStatus(200);
};
//# sourceMappingURL=payment.controller.js.map