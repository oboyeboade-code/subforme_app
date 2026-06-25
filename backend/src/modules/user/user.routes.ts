import { Router } from "express";
import { userController } from "./user.controller.js";
import { protect } from "../../middleware/protect.js";

const router = Router();

// Wishlist
router.get("/wishlist", protect, userController.wishlist);
router.post("/wishlist", protect, userController.addToWishlist);
router.delete("/wishlist/:serviceId", protect, userController.removeFromWishlist);
router.delete("/wishlist", protect, userController.clearWishlist);

// Cart
router.get("/cart", protect, userController.cart);
router.post("/cart", protect, userController.addToCart);
router.patch("/cart/:serviceId", protect, userController.updateCartItem);
router.delete("/cart/:serviceId", protect, userController.removeFromCart);
router.delete("/cart", protect, userController.clearCart);

export default router;
