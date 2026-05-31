const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const baseURL = rawBaseUrl.replace(/\/+$/, "");

const DEFAULT_TIMEOUT_MS = 10000;

type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue | QueryValue[]>;

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestConfig {
  method: HttpMethod;
  url: string;
  params?: QueryParams;
  data?: unknown;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: RequestConfig;
}

export class ApiError<T = unknown> extends Error {
  response?: ApiResponse<T>;
  config?: RequestConfig;
  status?: number;

  constructor(message: string, options?: { response?: ApiResponse<T>; config?: RequestConfig }) {
    super(message);
    this.name = "ApiError";
    this.response = options?.response;
    this.config = options?.config;
    this.status = options?.response?.status;
  }
}

function assertRelativePath(path: string) {
  if (/^(https?:)?\/\//i.test(path)) {
    throw new ApiError("Absolute URLs are not allowed for API requests.", {
      config: { method: "GET", url: path },
    });
  }
}

function buildUrl(path: string, params?: QueryParams) {
  assertRelativePath(path);

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${baseURL}${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null) {
            url.searchParams.append(key, String(item));
          }
        });
        return;
      }

      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function request<T = unknown>(config: RequestConfig): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  const requestUrl = buildUrl(config.url, config.params);
  const headers = new Headers();

  let body: BodyInit | undefined;

  if (config.data instanceof FormData) {
    body = config.data;
  } else if (config.data !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(config.data);
  }

  try {
    const response = await fetch(requestUrl, {
      method: config.method,
      headers,
      body,
      credentials: "include",
      signal: controller.signal,
    });

    const data = (await parseResponseBody(response)) as T;
    const apiResponse: ApiResponse<T> = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config,
    };

    if (!response.ok) {
      if (
        response.status === 401 &&
        typeof window !== "undefined" &&
        !config.url.includes("/api/auth/me")
      ) {
        window.dispatchEvent(new Event("auth:unauthorized"));
      }

      const message =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as { error?: { message?: unknown } }).error?.message === "string"
          ? (data as { error: { message: string } }).error.message
          : "API request failed.";

      throw new ApiError<T>(message, { response: apiResponse, config });
    }

    return apiResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("API request timed out.", { config });
    }

    throw new ApiError(error instanceof Error ? error.message : "API request failed.", { config });
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

const api = {
  get: <T = unknown>(url: string, options?: { params?: QueryParams }) =>
    request<T>({ method: "GET", url, params: options?.params }),
  post: <T = unknown>(url: string, data?: unknown) =>
    request<T>({ method: "POST", url, data }),
  patch: <T = unknown>(url: string, data?: unknown) =>
    request<T>({ method: "PATCH", url, data }),
  delete: <T = unknown>(url: string) =>
    request<T>({ method: "DELETE", url }),
};

export default api;

// ─── API 함수 ─────────────────────────────────────────────────

// 인증
export const authApi = {
  signup: (data: { name: string; email: string; password: string; user_type: "customer" | "freelancer"; phone?: string }) =>
    api.post("/api/auth/signup", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
  logout: () => api.post("/api/auth/logout"),
  me: () => api.get("/api/auth/me"),
  updateMe: (data: { name?: string; phone?: string }) =>
    api.patch("/api/users/me", data),
};

// 공개 API
export const publicApi = {
  getFreelancers: (params?: Record<string, unknown>) =>
    api.get("/api/public/freelancers", { params: params as QueryParams }),
  getFreelancer: (id: string) =>
    api.get(`/api/public/freelancers/${id}`),
  getFreelancerReviews: (id: string, params?: Record<string, unknown>) =>
    api.get(`/api/public/reviews/freelancer/${id}`, { params: params as QueryParams }),
};

// 고객
export const customerApi = {
  createRequest: (data: unknown) => api.post("/api/customer/requests", data),
  getRequests: (params?: Record<string, unknown>) =>
    api.get("/api/customer/requests", { params: params as QueryParams }),
  getRequest: (id: string) => api.get(`/api/customer/requests/${id}`),
  updateRequest: (id: string, data: unknown) =>
    api.patch(`/api/customer/requests/${id}`, data),
  deleteRequest: (id: string) => api.delete(`/api/customer/requests/${id}`),
  getRecommendations: (id: string) =>
    api.get(`/api/customer/requests/${id}/recommendations`),
};

// 프리랜서
export const freelancerApi = {
  submitProfile: (data: unknown) => api.post("/api/freelancer/profile", data),
  getProfile: () => api.get("/api/freelancer/profile"),
  updateProfile: (data: unknown) => api.patch("/api/freelancer/profile", data),
  createPortfolio: (data: unknown) => api.post("/api/freelancer/portfolio", data),
  getPortfolios: () => api.get("/api/freelancer/portfolio"),
  updatePortfolio: (id: string, data: unknown) =>
    api.patch(`/api/freelancer/portfolio/${id}`, data),
  deletePortfolio: (id: string) => api.delete(`/api/freelancer/portfolio/${id}`),
  getRequests: (params?: Record<string, unknown>) =>
    api.get("/api/freelancer/requests", { params: params as QueryParams }),
  createQuote: (data: unknown) => api.post("/api/freelancer/quotes", data),
  getSettlements: (params?: Record<string, unknown>) =>
    api.get("/api/freelancer/settlements", { params: params as QueryParams }),
};

// 예약 & 후기
export const bookingApi = {
  createBooking: (data: unknown) => api.post("/api/bookings", data),
  getBookings: (params?: Record<string, unknown>) =>
    api.get("/api/bookings", { params: params as QueryParams }),
  getBooking: (id: string) => api.get(`/api/bookings/${id}`),
  cancelBooking: (id: string, reason?: string) =>
    api.patch(`/api/bookings/${id}/cancel`, { cancel_reason: reason }),
  createReview: (data: unknown) => api.post("/api/reviews", data),
  getMyReviews: (params?: Record<string, unknown>) =>
    api.get("/api/reviews/me", { params: params as QueryParams }),
};

// 관리자
export const adminApi = {
  getDashboard: () => api.get("/api/admin/dashboard"),
  getFreelancers: (params?: Record<string, unknown>) =>
    api.get("/api/admin/freelancers", { params: params as QueryParams }),
  approveFreelancer: (id: string) =>
    api.patch(`/api/admin/freelancers/${id}/approve`),
  rejectFreelancer: (id: string, reason: string) =>
    api.patch(`/api/admin/freelancers/${id}/reject`, { reason }),
  getRequests: (params?: Record<string, unknown>) =>
    api.get("/api/admin/requests", { params: params as QueryParams }),
  getRequest: (id: string) => api.get(`/api/admin/requests/${id}`),
  updateRequestStatus: (id: string, status: string) =>
    api.patch(`/api/admin/requests/${id}/status`, { status }),
  createRecommendation: (data: unknown) =>
    api.post("/api/admin/recommendations", data),
  getBookings: (params?: Record<string, unknown>) =>
    api.get("/api/admin/bookings", { params: params as QueryParams }),
  updateBooking: (id: string, data: unknown) =>
    api.patch(`/api/admin/bookings/${id}`, data),
  getPayments: (params?: Record<string, unknown>) =>
    api.get("/api/admin/payments", { params: params as QueryParams }),
  updatePayment: (id: string, data: unknown) =>
    api.patch(`/api/admin/payments/${id}`, data),
  getSettlements: (params?: Record<string, unknown>) =>
    api.get("/api/admin/settlements", { params: params as QueryParams }),
  updateSettlement: (id: string, data: unknown) =>
    api.patch(`/api/admin/settlements/${id}`, data),
  getReviews: (params?: Record<string, unknown>) =>
    api.get("/api/admin/reviews", { params: params as QueryParams }),
  updateReview: (id: string, data: unknown) =>
    api.patch(`/api/admin/reviews/${id}`, data),
};

// 결제 (토스페이먼츠)
export const paymentApi = {
  prepare: (booking_id: string) =>
    api.post("/api/payments/prepare", { booking_id }),
  confirm: (data: { payment_key: string; order_id: string; amount: number }) =>
    api.post("/api/payments/confirm", data),
  cancel: (data: { booking_id: string; cancel_reason: string; cancel_amount?: number }) =>
    api.post("/api/payments/cancel", data),
  getByBookingId: (bookingId: string) =>
    api.get(`/api/payments/${bookingId}`),
};
