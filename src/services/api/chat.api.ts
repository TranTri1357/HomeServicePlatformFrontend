import { get, post, put, unwrap, type ApiResponse } from "./client";
import type { ConversationMessage } from "@/shared/types";

/** GET /api/chat/{bookingId} — full conversation for a booking (oldest first). */
export async function getConversation(bookingId: number): Promise<ConversationMessage[]> {
  const response = await get<ApiResponse<ConversationMessage[]>>(`/chat/${bookingId}`);
  return unwrap(response);
}

/** POST /api/chat/{bookingId} — send a message. Returns the created message. */
export async function sendMessage(
  bookingId: number,
  content: string,
): Promise<ConversationMessage> {
  const response = await post<ApiResponse<ConversationMessage>>(`/chat/${bookingId}`, { content });
  return unwrap(response);
}

/** PUT /api/chat/{bookingId}/read — mark the other party's messages as read. */
export async function markConversationRead(bookingId: number): Promise<boolean> {
  const response = await put<ApiResponse<boolean>>(`/chat/${bookingId}/read`, {});
  return unwrap(response);
}
