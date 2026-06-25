import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getRouteForRole } from "@/lib/auth/routes";

export const useRoleRedirect = (
  allowedPath: string,
  useV3 = false
) => {
  const navigate = useNavigate();
  const { data: res, isLoading, isError } = useAuthGuard();

  useEffect(() => {
    if (isLoading || isError || !res?.data) return;

    const role = res.data;

    if (role === "super-admin" && allowedPath === "/admin") {
      return;
    }

    const correctRoute = getRouteForRole({
      role,
      useV3,
    });

    if (correctRoute !== allowedPath) {
      navigate(correctRoute, { replace: true });
    }
  }, [res?.data, isLoading, isError, navigate, allowedPath, useV3]);

  return {
    isLoading,
    isError,
    role: res?.data,
  };
};
