import { toast } from "@/hooks/use-toast";
import type { NavigateFunction } from "react-router-dom";
import type { QueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/";
import { getRouteForRole } from "@/lib/auth/routes";

type Role = "customer" | "vendor" | "admin" | "super-admin";
type UIVersion = "editorial" | "v3";

type LoginParams = {
  email: string;
  password: string;
  expectedRole: Role;
  setLoading: (v: boolean) => void;
  navigate: NavigateFunction;
  queryClient: QueryClient;
  successMessage?: string;
  useV3?: boolean;
  setVersion?: (v: UIVersion) => void;
};

export async function handleLogin({
  email,
  password,
  expectedRole,
  setLoading,
  navigate,
  queryClient,
  successMessage = "Welcome back",
  useV3 = false,
  setVersion,
}: LoginParams) {
  try {
    setLoading(true);

    const res = await authApi.login(email, password);
    const user = res.data;

    if (user.role !== expectedRole) {
      toast({
        title: "Access denied",
        description: `This account is not a ${expectedRole} account.`,
        variant: "destructive",
      });
      return;
    }

    await queryClient.invalidateQueries();

    toast({
      title: res.message || successMessage,
      description: "Welcome back",
    });

    const route = getRouteForRole({
      role: user.role,
      useV3,
    });

    navigate(route, { replace: true });

    if (!useV3 && expectedRole !== "admin") setVersion?.("editorial");
  } catch (err: any) {
    toast({
      title: "Error",
      description: err.message || "Something went wrong",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
}

// src/lib/auth/loginHandler.ts

// Add this at the top
const DEMO_CREDS = {
  admin: { email: 'admin@demo.com', password: '12348765' },
  vendor: { email: 'vendor@demo.com', password: '12348765' },
  customer: { email: 'customer@demo.com', password: '12348765' },
  'super-admin': { email: 'super@demo.com', password: '12348765' },
} as const

// Add this new function below handleLogin
export async function handleGuestLogin({
  role,
  setLoading,
  navigate,
  queryClient,
  useV3 = true,
  setVersion,
}: Omit<LoginParams, 'email' | 'password' | 'expectedRole' | 'successMessage'> & { role: Role }) {
  const creds = DEMO_CREDS[role]

  return handleLogin({
    email: creds.email,
    password: creds.password,
    expectedRole: role,
    setLoading,
    navigate,
    queryClient,
    successMessage: `Logged in as ${role}`,
    useV3,
    setVersion,
  })
}