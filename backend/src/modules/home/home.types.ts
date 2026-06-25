export interface TopProvider {
  id: string;
  providerName: string;
  services: string[]; // Names of specific services that contributed to ranking
  logoUrl?: string;
}

export interface AppCategory {
  name: string;
  iconName?: string;
}

export interface IPlatformMetric {
  weekIdentifier: string;
  
  // UI-friendly arrays
  topProviders: TopProvider[]; // Now returning the full objects as requested
  mostOrderedServices: string[];

  totalRevenue: number;
  activeUsersCount: number;
  systemHealthStatus: "healthy" | "degraded" | "down";

  metadata?: {
    totalBookings?: number;
    detailedServices?: {
      id: string;
      name: string;
      totalOrders: number;
    }[];
    [key: string]: any;
  };
}
