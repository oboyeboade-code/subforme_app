import { AppError } from "../../middleware/errorMiddleware.js";
import { userService } from "./user.service.js";
export const userController = {
    wishlist: async (req, res, next) => {
        try {
            const servicesData = await userService.wishlist(req.user.userId);
            res.status(200).json({ status: "success", message: "Wishlist fetched successfully", data: { services: servicesData } });
        }
        catch (error) {
            next(error);
        }
    },
    addToWishlist: async (req, res, next) => {
        try {
            const { serviceId } = req.body;
            if (!serviceId)
                throw new AppError("serviceId is required", 400);
            const updatedWishlist = await userService.addToWishlist(req.user.userId, serviceId);
            res.status(200).json({ status: "success", message: "Added to wishlist", data: { services: updatedWishlist } });
        }
        catch (error) {
            next(error);
        }
    },
    removeFromWishlist: async (req, res, next) => {
        try {
            const serviceId = req.params.serviceId;
            if (!serviceId)
                throw new AppError("serviceId is required", 400);
            const updatedWishlist = await userService.removeFromWishlist(req.user.userId, serviceId);
            res.status(200).json({ status: "success", message: "Removed from wishlist", data: { services: updatedWishlist } });
        }
        catch (error) {
            next(error);
        }
    },
    clearWishlist: async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const wishlist = await userService.clearWishlist(userId);
            res.status(200).json({
                status: "success",
                message: "Wishlist cleared successfully",
                data: {
                    services: wishlist,
                },
            });
        }
        catch (error) {
            next(error);
        }
    },
    cart: async (req, res, next) => {
        try {
            const cartData = await userService.cart(req.user.userId);
            res.status(200).json({ status: "success", message: "Cart fetched successfully", data: { cart: cartData } });
        }
        catch (error) {
            next(error);
        }
    },
    addToCart: async (req, res, next) => {
        try {
            const { serviceId, quantity } = req.body;
            if (!serviceId)
                throw new AppError("serviceId is required", 400);
            const cart = await userService.addToCart(req.user.userId, serviceId, quantity);
            res.status(200).json({ status: "success", message: "Added to cart", data: { cart } });
        }
        catch (error) {
            next(error);
        }
    },
    removeFromCart: async (req, res, next) => {
        try {
            const serviceId = req.params.serviceId;
            const cart = await userService.removeFromCart(req.user.userId, serviceId);
            res.status(200).json({ status: "success", message: "Removed from cart", data: { cart } });
        }
        catch (error) {
            next(error);
        }
    },
    updateCartItem: async (req, res, next) => {
        try {
            const serviceId = req.params.serviceId;
            const { quantity } = req.body;
            const cart = await userService.updateCartItemQuantity(req.user.userId, serviceId, quantity);
            res.status(200).json({ status: "success", message: "Cart updated", data: { cart } });
        }
        catch (error) {
            next(error);
        }
    },
    clearCart: async (req, res, next) => {
        try {
            const cart = await userService.clearCart(req.user.userId);
            res.status(200).json({ status: "success", message: "Cart cleared", data: { cart } });
        }
        catch (error) {
            next(error);
        }
    },
};
//# sourceMappingURL=user.controller.js.map