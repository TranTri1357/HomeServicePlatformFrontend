export interface ChatMessage {
  id: number;
  from: "tech" | "user";
  text: string;
  time: string;
}

/** A message in a booking conversation — GET/POST /api/chat/{bookingId}. */
export interface ConversationMessage {
  messageId: number;
  bookingId: number;
  senderId: number;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}
