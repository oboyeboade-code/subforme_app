import { apiRequest, ApiResponse } from "./client";
import { IService, IServiceCode } from "./service.api";
import type { AppCategory } from "./home.api";

export interface IVendorBusiness {
  _id: string;
  ownerUserId: string;
  serviceIds?: string[];
  businessName: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  category: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  operatingHours?: string;
  bankAccountDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  status: "pending" | "active" | "suspended" | "suspended";
  createdAt: string;
  updatedAt: string;
}

export type VendorBusiness = IVendorBusiness

export type VendorUIStatus = "active" | "paused" | "pending";
// export type ProviderCategory = string

export interface Provider {
  id: string;                     // from v._id
  name: string;                   // from v.businessName
  category: string;     // from v.category as ProviderCategory
  state: string;                  // from stateLoose
  country: string;                // from countryLoose
  services: number;               // from v.serviceIds?.length ?? 0
  status: VendorUIStatus;         // mapped: suspended -> paused
}

export type VendorServiceDoc = IService;

export type VendorServiceCode = IServiceCode & {
  serviceId: { _id: string; name: string; priceNaira: number; image: string } | null;
  userId: { _id: string; email: string; role: string } | null;
};

export type VendorMe = {
  vendor: VendorBusiness;
  services: VendorServiceDoc[];
  offers: unknown[];
  serviceCodes: VendorServiceCode[];
};

export type VendorEarnings = {
  totals: { grossNaira: number; codesIssued: number; codesUsed: number; codesActive: number };
  perService: Array<{
    serviceId: string;
    name: string;
    priceNaira: number;
    codesIssued: number;
    codesUsed: number;
    codesActive: number;
    grossNaira: number;
  }>;
};

export const vendorBusinessApi = {
  // From admin.api.ts
  getVendors(): Promise<ApiResponse<VendorBusiness[]>> {
    return apiRequest<VendorBusiness[]>("/api/admin/vendors");
  },

  getVendorById(id: string): Promise<ApiResponse<VendorBusiness>> {
    return apiRequest<VendorBusiness>(`/api/admin/vendors/${id}`);
  },

  createVendor(payload: Partial<IVendorBusiness>): Promise<ApiResponse<VendorBusiness>> {
    return apiRequest<VendorBusiness>("/api/admin/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  updateVendor(id: string, payload: Partial<IVendorBusiness>): Promise<ApiResponse<VendorBusiness>> {
    return apiRequest<VendorBusiness>(`/api/admin/providers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  deleteVendor(id: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/api/admin/providers/${id}`, {
      method: "DELETE",
    });
  },

  // From vendor.api.ts
  getVendorMe(): Promise<ApiResponse<VendorMe>> {
    return apiRequest<VendorMe>(`/api/vendor/me`);
  },

  getVendorEarnings(): Promise<ApiResponse<VendorEarnings>> {
    return apiRequest<VendorEarnings>(`/api/vendor/me/earnings`);
  },

  // This redeem function is vendor-specific action on a service code
  redeemServiceCode(servCode: string, authCode: string): Promise<ApiResponse<VendorServiceCode>> {
    return apiRequest<VendorServiceCode>(`/api/vendor/me/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ servCode, authCode }),
    });
  },
};
