type Role = "customer" | "vendor" | "admin" | "super-admin";
// type UIVersion = "editorial" | "v3";

type GetRouteParams = {
  role: Role;
  useV3?: boolean;
};

export function getRouteForRole({
  role,
  useV3 = false,
}: GetRouteParams): string {
    switch (role) {
    case "customer":
        return useV3 ? "/v3/app" : "/app";

    case "vendor":
        return useV3
        ? "/v3/vendor"
        : "/vendor";

    case "admin":
    case "super-admin":
        return "/admin";

    default:
        throw new Error(`Unknown role: ${role}`);
    }
}