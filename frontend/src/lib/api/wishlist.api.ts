import { apiRequest, ApiResponse } from "./client";
import { IWishlistItem } from "./auth.api";

export type WishlistResponse = {
  wishlist: IWishlistItem[];
};

export const wishlistApi = {
  getWishlist(): Promise<ApiResponse<WishlistResponse>> {
    return apiRequest<WishlistResponse>("/api/wishlist");
  },

  addToWishlist(serviceId: string): Promise<ApiResponse<WishlistResponse>> {
    return apiRequest<WishlistResponse>("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId }),
    });
  },

  removeFromWishlist(serviceId: string): Promise<ApiResponse<WishlistResponse>> {
    return apiRequest<WishlistResponse>(`/api/wishlist/${serviceId}`, {
      method: "DELETE",
    });
  },

  clearWishlist(): Promise<ApiResponse<WishlistResponse>> {
    return apiRequest<WishlistResponse>("/api/wishlist", {
      method: "DELETE",
    });
  },
};
