import type { ChatMessage } from "@/shared/types";

export const chatMessages: ChatMessage[] = [
  { id: 1, from: "tech", text: "Xin chào! Tôi đã nhận yêu cầu của bạn và đang trên đường đến.", time: "09:02" },
  { id: 2, from: "user", text: "Cảm ơn bạn! Chuông cửa nhà tôi ở tầng 3 nhé.",                  time: "09:03" },
  { id: 3, from: "tech", text: "Vâng tôi biết rồi. Khoảng 10 phút nữa tôi đến.",                 time: "09:04" },
  { id: 4, from: "user", text: "Ok, tôi sẽ chờ bạn ở dưới nhé 👍",                              time: "09:05" },
  { id: 5, from: "tech", text: "Tôi đã đến tòa nhà rồi, đang lên thang máy ạ.",                  time: "09:15" },
];
