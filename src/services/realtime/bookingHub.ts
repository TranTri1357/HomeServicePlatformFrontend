import {
  HubConnectionBuilder,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { getAccessToken, WS_URL } from "@/services/api";

const HUB_BASE = WS_URL.replace(/\/$/, "");

/**
 * Connect to the booking hub and receive realtime status changes for the
 * logged-in user's own bookings. The server auto-joins each authenticated user
 * to their personal group on connect, so no explicit join is needed. Returns a
 * disposer that stops the connection.
 */
export async function connectBookingStatus(
  onStatus: (bookingId: number, status: number) => void,
): Promise<() => void> {
  const connection: HubConnection = new HubConnectionBuilder()
    .withUrl(`${HUB_BASE}/booking-hub`, {
      accessTokenFactory: () => getAccessToken() ?? "",
      // Bearer token, không dùng cookie → tắt credentials để tránh CORS wildcard.
      withCredentials: false,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  connection.on("ReceiveBookingStatus", (payload: { bookingId: number; status: number }) => {
    onStatus(payload.bookingId, payload.status);
  });

  await connection.start();

  return () => {
    void connection.stop();
  };
}
