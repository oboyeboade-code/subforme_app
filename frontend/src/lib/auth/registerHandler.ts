import { toast } from "@/hooks/use-toast";
import type { NavigateFunction } from "react-router-dom";
import { authApi } from "@/lib/api/";

type RegisterParams = {
  payload: Record<string, string>;
  setLoading: (v: boolean) => void;
  navigate: NavigateFunction;
  successMessage?: string;
  redirectTo?: string;
};

export async function handleRegister({
  payload,
  setLoading,
  navigate,
  successMessage = "Registration successful",
  redirectTo = "/login",
}: RegisterParams) {
  try {
    setLoading(true);

    await authApi.register(payload);

    toast.success({
      title: successMessage
    });

    navigate(redirectTo);
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