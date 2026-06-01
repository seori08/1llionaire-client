import type { BackendListResponse, BackendResponse, NotificationItem } from "../api-contracts";
import http, { toQueryParams } from "../http";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const baseURL = rawBaseUrl.replace(/\/+$/, "");

export const notificationApi = {
  getNotifications: (params?: Record<string, unknown>) =>
    http.get<BackendListResponse<NotificationItem>>("/api/notifications", {
      params: toQueryParams(params),
    }),

  getUnreadCount: () =>
    http.get<BackendResponse<{ count: number }>>("/api/notifications/unread-count"),

  markAsRead: (id: string) =>
    http.patch<BackendResponse<NotificationItem>>(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    http.patch<BackendResponse<null>>("/api/notifications/read-all"),

  deleteNotification: (id: string) =>
    http.delete<BackendResponse<null>>(`/api/notifications/${id}`),

  getStreamUrl: () => `${baseURL}/api/notifications/stream`,
};
