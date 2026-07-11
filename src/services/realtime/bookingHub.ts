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

/**
 * Customer-side listener for the emergency booking waiting screen. Fires
 * `onStatus` on any booking status change (accept = status 1) and `onDeclined`
 * when the chosen tasker rejects. Returns a disposer that stops the connection.
 */
export async function connectEmergencyCustomer(handlers: {
  onStatus: (bookingId: number, status: number) => void;
  onDeclined: (bookingId: number) => void;
}): Promise<() => void> {
  const connection: HubConnection = new HubConnectionBuilder()
    .withUrl(`${HUB_BASE}/booking-hub`, {
      accessTokenFactory: () => getAccessToken() ?? "",
      withCredentials: false,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  connection.on("ReceiveBookingStatus", (p: { bookingId: number; status: number }) => {
    handlers.onStatus(p.bookingId, p.status);
  });
  connection.on("ReceiveEmergencyDeclined", (p: { bookingId: number }) => {
    handlers.onDeclined(p.bookingId);
  });

  await connection.start();

  return () => {
    void connection.stop();
  };
}

/** Payload of an incoming emergency request pushed to the chosen tasker. */
export interface EmergencyRequestPush {
  bookingId: number;
  serviceName: string;
  addressLine: string;
  amount: number;
  distanceKm: number;
  expiresInSeconds: number;
  latitude: number;
  longitude: number;
}

/**
 * Tasker-side listener: fires `onRequest` when a customer sends an emergency
 * request to this tasker, and `onCancelled` when the customer cancels/times out
 * before the tasker responds. Returns a disposer that stops the connection.
 */
export async function connectEmergencyTasker(handlers: {
  onRequest: (req: EmergencyRequestPush) => void;
  onCancelled: (bookingId: number) => void;
}): Promise<() => void> {
  const connection: HubConnection = new HubConnectionBuilder()
    .withUrl(`${HUB_BASE}/booking-hub`, {
      accessTokenFactory: () => getAccessToken() ?? "",
      withCredentials: false,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  connection.on("ReceiveEmergencyRequest", (p: EmergencyRequestPush) => handlers.onRequest(p));
  connection.on("ReceiveEmergencyCancelled", (p: { bookingId: number }) =>
    handlers.onCancelled(p.bookingId),
  );

  await connection.start();

  return () => {
    void connection.stop();
  };
}
