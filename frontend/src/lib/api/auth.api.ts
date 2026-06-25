import { apiRequest, ApiResponse } from "./client";

export type UserRole = "customer" | "vendor" | "admin" | "super-admin";

export interface IBaseUser {
  _id: string;
  email: string;
  phone?: string;
  role: UserRole;
  emailVerified: boolean;
  lastSignInAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAdmin extends IBaseUser {
  permissions?: string[];
  region?: string;
  listingReviewCount?: number;
}

export interface ICartItem {
  id: string;
  qty: number;
}

export interface IWishlistItem {
  id: string;
  qty: number;
}

export interface ICustomer extends IBaseUser {
  wishlist?: IWishlistItem[];
  cartItems?: ICartItem[];
  coins?: number;
  savedVendors?: string[];
  totalSpentNaira?: number;
  referralCode?: string;
  preferredPaymentChannel?: string;
}

export interface IVendor extends IBaseUser {
  vendorBusinessId?: string;
  isOwner?: boolean;
  totalRedemptions?: number;
  lastActiveAt?: string;
}

export interface ISuperAdmin extends IBaseUser {
  isGodMode?: boolean;
  canManageAdmins?: boolean;
  canAccessFinancials?: boolean;
  canManageSettings?: boolean;
  canPerformBackups?: boolean;
  twoFactorSecret?: string;
  managedAdmins?: string[];
}

export type User = IAdmin | ICustomer | IVendor | ISuperAdmin | IBaseUser;

type LoginResponse = {
  role: UserRole;
  token: string;
};

type MeResponse = {
  user: User;
};

export const authApi = {
  login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return apiRequest<LoginResponse>("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  },

  register(payload: Record<string, unknown>): Promise<ApiResponse<void>> {
    return apiRequest<void>("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  logout(): Promise<ApiResponse<void>> {
    return apiRequest<void>("/api/logout", {
      method: "POST",
    });
  },

  forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiRequest<void>("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(token: string, password: string): Promise<ApiResponse<void>> {
    return apiRequest<void>("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
  },

  me(): Promise<ApiResponse<MeResponse>> {
    return apiRequest<MeResponse>("/api/me");
  },

  getUserRole(): Promise<ApiResponse<UserRole>> {
    return apiRequest<UserRole>("/api/role");
  },
};
