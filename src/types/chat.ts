export interface ChatMessage {
  id: number;
  from: "tech" | "user";
  text: string;
  time: string;
}
