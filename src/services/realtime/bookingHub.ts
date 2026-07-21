import {
  HubConnectionBuilder,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { getAccessToken, WS_URL } from "@/services/api";

const HUB_BASE = WS_URL.replace(/\/$/, "");


export async function connectBookingStatus(
  onStatus: (bookingId: number, status: number) => void,
): Promise<() => void> {
  const connection: HubConnection = new HubConnectionBuilder()
    .withUrl(`${HUB_BASE}/booking-hub`, {
      accessTokenFactory: () => getAccessToken() ?? "",
      
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


export async function connectEmergencyCustomer(handlers: {
  onStatus: (bookingId: number, status: number) => void;
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

  await connection.start();

  return () => {
    void connection.stop();
  };
}


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
