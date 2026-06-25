import { apiRequest, ApiResponse } from "./client";
import type { ICartItem } from "./auth.api"; // Re-using ICartItem from auth.api

export type CartResponse = {
  cart: ICartItem[];
};

export const cartApi = {
  getCart(): Promise<ApiResponse<CartResponse>> {
    return apiRequest<CartResponse>("/api/cart");
  },

  addToCart(serviceId: string, quantity = 1): Promise<ApiResponse<CartResponse>> {
    return apiRequest<CartResponse>("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId, quantity }),
    });
  },

  removeFromCart(serviceId: string): Promise<ApiResponse<CartResponse>> {
    return apiRequest<CartResponse>(`/api/cart/${serviceId}`, {
      method: "DELETE",
    });
  },

  updateCartItem(serviceId: string, quantity: number): Promise<ApiResponse<CartResponse>> {
    return apiRequest<CartResponse>(`/api/cart/${serviceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
  },

  clearCart(): Promise<ApiResponse<CartResponse>> {
    return apiRequest<CartResponse>("/api/cart", {
      method: "DELETE",
    });
  },
};
