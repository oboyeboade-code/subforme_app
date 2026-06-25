const API_URL = import.meta.env.VITE_API_URL;

export type ApiResponse<TData> = {
  businessName: string;
  status: "success" | "error";
  message: string;
  data: TData;
}

async function tryFetch(input: RequestInfo, init?: RequestInit): Promise<Response | null> {
  try {
    const res = await fetch(input, { credentials: "include", ...init });
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json") && res.redirected) return null;
    return res;
  } catch {
    return null;
  }
}

export async function apiRequest<TData>(
  path: string,
  init?: RequestInit
): Promise<ApiResponse<TData>> {
  const res = await tryFetch(`${API_URL}${path}`, init);

  if (!res) {
    throw new Error("Network error");
  }

  const body: ApiResponse<TData> = await res.json().catch(() => ({
    status: "error",
    message: "Invalid JSON",
    data: null as TData,
  }));

  if (!res.ok || body.status === "error") {
    throw new Error(body?.message || "Request failed");
  }

  return body;
}
