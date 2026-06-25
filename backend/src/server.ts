import "./config/env.js";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { protect } from "./middleware/protect.js";
import { authorize } from "./middleware/authorize.js";

import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/user/user.routes.js";
import profileRoutes from "./modules/user/profile.routes.js";
import servicesRoutes from "./modules/service/service.routes.js";
import coinsRoutes from "./modules/coin/coin.routes.js";
import vouchersRoutes from "./modules/voucher/voucher.routes.js";
import subscriptionsRoutes from "./modules/subscription/subscription.routes.js";
import vendorRoutes from "./modules/vendorBusiness/vendorBusiness.routes.js";
import bookingRoutes from "./modules/booking/booking.routes.js";
import listingRequestRoutes from "./modules/listingRequest/listingRequest.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import paymentWebhookRoutes from "./modules/payment/payment.webhook.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import homeRoutes from "./modules/home/home.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import wishlistRoutes from "./modules/wishlist/wishlist.routes.js";
import spiderHuntRoutes from "./modules/game/spiderHunt.routes.js";
import cron from 'node-cron';
import { homeService } from './modules/home/home.service.js';
import { globalErrorHandler } from "./middleware/errorMiddleware.js";

const app = express();
app.set("trust proxy", 1);

const PORT: number = Number(process.env.PORT) || 5000;

// Sync metrics every hour
cron.schedule('0 0 * * 0', async () => {
  console.log('[Cron] Starting Platform Metrics sync...');
  try {
    await homeService.syncPlatformMetrics();
    console.log('[Cron] Platform Metrics sync successful.');
  } catch (error) {
    console.error('[Cron] Platform Metrics sync failed:', error);
  }
});

// CRITICAL: Raw body for webhook BEFORE express.json()
app.use("/api/webhooks/paystack", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// --- API Routes ---
// Auth lives at /api/* (frontend calls /login, /register, /me, /role directly)
app.use("/api", authRoutes);
// Profile also lives at /api/* (frontend calls /profile)
app.use("/api", profileRoutes);

// Resource routes
app.use("/api/users", usersRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/coins", coinsRoutes);
app.use("/api/vouchers", vouchersRoutes);
app.use("/api/subscriptions", subscriptionsRoutes);
app.use("/api/cart", protect, cartRoutes);
app.use("/api/wishlist", protect, wishlistRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/home", homeRoutes);

app.use("/api/games", protect, spiderHuntRoutes);

// Webhooks (mounted at /api/webhooks/paystack — no `protect`)
app.use("/api/webhooks", paymentWebhookRoutes);

// Role-gated areas
app.use("/api/vendor", protect, authorize("vendor"), vendorRoutes);
app.use("/api/booking", protect, authorize("customer", "vendor", "admin", "super-admin"), bookingRoutes);
app.use("/api/listing-requests", protect, authorize("vendor", "admin", "super-admin"), listingRequestRoutes);
app.use("/api/admin", protect, authorize("admin", "super-admin"), adminRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.send("API is running");
});

app.use(globalErrorHandler);

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("MONGO_URI missing");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(async () => {
    // await homeService.syncPlatformMetrics(); // run immediately
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });
