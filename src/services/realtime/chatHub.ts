import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import { getAccessToken, WS_URL } from "@/services/api";
import type { ConversationMessage } from "@/shared/types";


const HUB_BASE = WS_URL.replace(/\/$/, "");


export async function connectChat(
  bookingId: number,
  onMessage: (msg: ConversationMessage) => void,
): Promise<() => void> {
  const connection: HubConnection = new HubConnectionBuilder()
    .withUrl(`${HUB_BASE}/chat-hub`, {
      accessTokenFactory: () => getAccessToken() ?? "",
      
      
      
      withCredentials: false,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  connection.on("ReceiveMessage", (msg: ConversationMessage) => onMessage(msg));

  
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
