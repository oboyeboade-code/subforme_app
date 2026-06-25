import { apiRequest, ApiResponse } from "./client";

export type Profile = {
  _id: string;

  email: string;
  name: string;

  avatarUrl?: string;
  bio?: string;
  timezone?: string;

  notificationsEnabled: boolean;
  emailReceipts: boolean;

  uiVersion: "editorial" | "v3";

  phone?: string;
  subscriptionPlan?: "basic" | "premium";

  createdAt: string;
  updatedAt: string;
};

export const userApi = {
  updateProfile(data: Partial<Profile>): Promise<ApiResponse<Profile>> {
    return apiRequest<Profile>("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  getProfile(): Promise<ApiResponse<Profile>> {
    return apiRequest<Profile>("/api/profile");
  },
};