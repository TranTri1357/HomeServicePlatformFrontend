import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { getAccessToken, WS_URL } from "@/services/api";
import type { ConversationMessage } from "@/shared/types";

// Same base as the rest of the app (defaults to the Render backend in client.ts).
const HUB_BASE = WS_URL.replace(/\/$/, "");

/**
 * Open a chat hub connection for one booking conversation, join its group and
 * invoke `onMessage` for every incoming message. Returns a disposer that leaves
 * the group and stops the connection.
 */
export async function connectChat(
  bookingId: number,
  onMessage: (msg: ConversationMessage) => void,
): Promise<() => void> {
  const connection: HubConnection = new HubConnectionBuilder()
    .withUrl(`${HUB_BASE}/chat-hub`, {
      accessTokenFactory: () => getAccessToken() ?? "",
      // Auth qua bearer token (accessTokenFactory), không dùng cookie. Tắt credentials
      // để request negotiate không bị chặn CORS: server trả Access-Control-Allow-Origin
      // '*' (wildcard) mà trình duyệt cấm wildcard khi credentials mode = 'include'.
      withCredentials: false,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  connection.on("ReceiveMessage", (msg: ConversationMessage) => onMessage(msg));

  // Rejoin the group after an automatic reconnect.
  connection.onreconnected(() => {
    void connection.invoke("JoinConversation", bookingId).catch(() => {});
  });

  await connection.start();
  await connection.invoke("JoinConversation", bookingId);

  return () => {
    if (connection.state === HubConnectionState.Connected) {
      void connection.invoke("LeaveConversation", bookingId).catch(() => {});
    }
    void connection.stop();
  };
}
