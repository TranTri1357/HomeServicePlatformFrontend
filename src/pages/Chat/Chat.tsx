import { useState } from "react";
import { ChevronLeft, Phone, MapPin, Paperclip, Camera, Send } from "lucide-react";
import type { Screen } from "@/shared/types";
import { chatMessages } from "@/services/Chat/chat.data";
import { technicians } from "@/services/Technician/technician.data";
import { Avatar } from "@/shared/ui";

export function Chat({
  onNavigate,
  isProvider = false,
}: {
  onNavigate: (s: Screen) => void;
  isProvider?: boolean;
}) {
  const [messages, setMessages] = useState(chatMessages);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        from: isProvider ? "tech" : "user",
        text: input,
        time: new Date().toLocaleTimeString("vi", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setInput("");
  };

  const tech = technicians[0];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => onNavigate(isProvider ? "providerDashboard" : "customerHome")}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <Avatar src={tech.avatar} size={40} name={tech.name} />
        <div className="flex-1">
          <p className="font-bold text-sm text-foreground">
            {isProvider ? "Hoàng Văn E (Khách hàng)" : tech.name}
          </p>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs text-green-600 font-medium">Đang online</span>
          </div>
        </div>
        <button className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
          <Phone className="w-4 h-4 text-green-600" />
        </button>
        <button className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
          <MapPin className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
        {/* Booking info banner */}
        <div className="flex justify-center">
          <div className="bg-white border border-border rounded-2xl px-4 py-2.5 text-center shadow-sm">
            <p className="text-xs font-semibold text-foreground">Đặt lịch #BK001 · Sửa điện</p>
            <p className="text-xs text-muted-foreground">20/06/2026, 09:00 · Đang thực hiện</p>
          </div>
        </div>

        {messages.map((msg) => {
          const isMe = isProvider ? msg.from === "tech" : msg.from === "user";
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              {!isMe && <Avatar src={tech.avatar} size={32} name={tech.name} />}
              <div
                className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white text-foreground rounded-tl-sm shadow-sm"}`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-muted-foreground">{msg.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-border px-4 py-3 flex items-end gap-2">
        <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors flex-shrink-0">
          <Paperclip className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors flex-shrink-0">
          <Camera className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1 flex items-end bg-muted rounded-2xl px-3 py-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            className="flex-1 bg-transparent text-sm focus:outline-none resize-none max-h-24"
            placeholder="Nhập tin nhắn..."
            rows={1}
          />
        </div>
        <button
          onClick={send}
          className={`w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 transition-colors ${input.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-muted"}`}
        >
          <Send className={`w-4 h-4 ${input.trim() ? "text-white" : "text-muted-foreground"}`} />
        </button>
      </div>
    </div>
  );
}
