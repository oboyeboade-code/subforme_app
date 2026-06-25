import mongoose from "mongoose";
import { AppError } from "../../middleware/errorMiddleware.js";
import { CustomerModel } from "./user.model.js";
import { ServiceModel } from "../service/service.model.js";

interface LeanItemWithQty {
  serviceId: mongoose.Types.ObjectId;
  quantity: number;
}

const toIdQty = (item: LeanItemWithQty) => ({
  id: item.serviceId.toString(),
  qty: item.quantity,
});

export const userService = {
  // --- WISHLIST SERVICES ---

  wishlist: async (userId?: string): Promise<ReturnType<typeof toIdQty>[]> => {
    if (!userId) throw new AppError("Unauthorized", 401);
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new AppError("Invalid user id", 400);

    const customer = await CustomerModel.findById(userId)
      .select("wishlist.serviceId wishlist.quantity")
      .lean<{ wishlist?: LeanItemWithQty[] }>();

    if (!customer) throw new AppError("Customer not found", 404);
    return (customer.wishlist || []).map(toIdQty);
  },

  addToWishlist: async (userId: string, serviceId: string): Promise<ReturnType<typeof toIdQty>[]> => {
    // Check exists & get data for denormalization (Required for Postman-safety)
    const service = await ServiceModel.findById(serviceId).lean();
    if (!service) throw new AppError("Service not found", 404);

    const result = await CustomerModel.findOneAndUpdate(
      { _id: userId, 'wishlist.serviceId': { $ne: serviceId } },
      {
        $push: {
          wishlist: {
            serviceId: service._id,
            name: service.name,
            image: service.image,
            addedAt: new Date(),
          }
        }
      },
      { new: true, projection: { wishlist: 1 } }
    ).lean<{ wishlist?: LeanItemWithQty[] }>();

    if (!result) {
      const customerExists = await CustomerModel.exists({ _id: userId });
      if (!customerExists) throw new AppError("Customer not found", 404);
      throw new AppError("Service already in wishlist", 400);
    }

    return (result.wishlist || []).map(toIdQty);
  },

  removeFromWishlist: async (userId: string, serviceId: string): Promise<ReturnType<typeof toIdQty>[]> => {
    const result = await CustomerModel.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: { serviceId } } },
      { new: true, projection: { wishlist: 1 } }
    ).lean<{ wishlist?: LeanItemWithQty[] }>();

    if (!result) throw new AppError("Customer not found", 404);
    return (result.wishlist || []).map(toIdQty);
  },

  clearWishlist: async (userId: string): Promise<ReturnType<typeof toIdQty>[]> => {
    const result = await CustomerModel.updateOne({ _id: userId }, { $set: { wishlist: [] } });
    if (result.matchedCount === 0) throw new AppError("Customer not found", 404);
    return [];
  },

  // --- CART SERVICES ---

  cart: async (userId?: string): Promise<ReturnType<typeof toIdQty>[]> => {
    if (!userId) throw new AppError("Unauthorized", 401);
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new AppError("Invalid user id", 400);

    const customer = await CustomerModel.findById(userId)
      .select("cartItems.serviceId cartItems.quantity")
      .lean<{ cartItems?: LeanItemWithQty[] }>();
    
    if (!customer) throw new AppError("Customer not found", 404);
    return (customer.cartItems || []).map(toIdQty);
  },

  cartItemsForUser: async (userId: string): Promise<ReturnType<typeof toIdQty>[]> => {
    const customer = await CustomerModel.findById(userId)
      .select("cartItems.serviceId cartItems.quantity")
      .lean<{ cartItems?: LeanItemWithQty[] }>();
    
    if (!customer) throw new AppError("Customer not found", 404);
    return (customer.cartItems || []).map(toIdQty);
  },

  addToCart: async (userId: string, serviceId: string, quantity: number = 1): Promise<ReturnType<typeof toIdQty>[]> => {
    // Check exists & get data for denormalization (Required for Postman-safety)
    const service = await ServiceModel.findById(serviceId).select("name image priceNaira").lean();
    if (!service) throw new AppError("Service not found", 404);

    const result = await CustomerModel.updateOne(
      { _id: userId, "cartItems.serviceId": serviceId },
      { $inc: { "cartItems.$.quantity": quantity } }
    );

    if (result.modifiedCount === 0) {
      await CustomerModel.updateOne(
        { _id: userId },
        {
          $push: {
            cartItems: {
              serviceId,
              name: service.name,
              image: service.image,
              priceNaira: service.priceNaira,
              quantity,
              addedAt: new Date(),
            },
          },
        }
      );
    }

    return userService.cartItemsForUser(userId);
  },

  removeFromCart: async (userId: string, serviceId: string): Promise<ReturnType<typeof toIdQty>[]> => {
    const result = await CustomerModel.updateOne({ _id: userId }, { $pull: { cartItems: { serviceId } } });
    if (result.matchedCount === 0) throw new AppError("Customer not found", 404);
    return userService.cartItemsForUser(userId);
  },

  updateCartItemQuantity: async (userId: string, serviceId: string, quantity: number): Promise<ReturnType<typeof toIdQty>[]> => {
    if (!Number.isInteger(quantity) || quantity < 0) throw new AppError("Quantity must be a non-negative integer", 400);

    const result = await CustomerModel.findOneAndUpdate(
      { _id: userId, "cartItems.serviceId": serviceId },
      { $set: { "cartItems.$.quantity": quantity } },
      { new: true, projection: { "cartItems.serviceId": 1, "cartItems.quantity": 1 } }
    ).lean<{ cartItems?: LeanItemWithQty[] }>();

    if (!result) {
      const customerExists = await CustomerModel.exists({ _id: userId });
      if (!customerExists) throw new AppError("Customer not found", 404);
      throw new AppError("Item not in cart", 404);
    }

    return (result.cartItems || []).map(toIdQty);
  },

  clearCart: async (userId: string): Promise<ReturnType<typeof toIdQty>[]> => {
    const result = await CustomerModel.updateOne({ _id: userId }, { $set: { cartItems: [] } });
    if (result.matchedCount === 0) throw new AppError("Customer not found", 404);
    return [];
  },
};
