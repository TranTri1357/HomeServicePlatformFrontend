import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Phone, MapPin, Send, AlertCircle, Loader2 } from "lucide-react";
import type { Screen, ConversationMessage } from "@/shared/types";
import { chatApi } from "@/services/api";
import { useGoBack } from "@/app/routes/useGoBack";
import { connectChat } from "@/services/realtime/chatHub";
import { useApi } from "@/shared/hooks";
import { useAuth } from "@/app/providers";
import { Avatar } from "@/shared/ui";
import { notify } from "@/shared/lib";

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export function Chat({
  onNavigate,
  isProvider = false,
  data,
}: {
  onNavigate: (s: Screen, d?: object) => void;
  isProvider?: boolean;
  data?: { bookingId?: number };
}) {
  const { user } = useAuth();
  const myId = user?.userId;
  const bookingId = data?.bookingId;
  const backTarget: Screen = isProvider ? "providerDashboard" : "bookingManagement";
  const goBack = useGoBack(backTarget);

  const { data: initial, loading, error, refetch } = useApi(
    () => chatApi.getConversation(bookingId!),
    { immediate: Boolean(bookingId) },
  );

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addMessage = (msg: ConversationMessage) =>
    setMessages((prev) => (prev.some((m) => m.messageId === msg.messageId) ? prev : [...prev, msg]));

  
  useEffect(() => {
    if (initial) setMessages(initial);
  }, [initial]);

  
  useEffect(() => {
    if (!bookingId) return;
    let dispose = () => {};
    connectChat(bookingId, addMessage)
      .then((d) => {
        dispose = d;
      })
      .catch(() => {
        
      });
    return () => dispose();
  }, [bookingId]);

  
  useEffect(() => {
    if (bookingId) void chatApi.markConversationRead(bookingId).catch(() => {});
  }, [bookingId, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  
  if (!bookingId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-blue-400" />
        <p className="text-sm text-muted-foreground">
          Hãy mở cuộc trò chuyện từ một đơn đặt lịch cụ thể.
        </p>
        <button
          onClick={() => onNavigate(backTarget)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Về danh sách đơn
        </button>
      </div>
    );
  }

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    try {
      const msg = await chatApi.sendMessage(bookingId, text);
      addMessage(msg); 
    } catch (err) {
      notify.error(err);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const otherName =
    messages.find((m) => m.senderId !== myId)?.senderName ?? (isProvider ? "Khách hàng" : "Thợ");

  return (
    <div className="flex flex-col h-full">
      {}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <Avatar size={40} name={otherName} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-foreground truncate">{otherName}</p>
          <p className="text-xs text-muted-foreground">Đơn BK{bookingId}</p>
        </div>
        <button className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
          <Phone className="w-4 h-4 text-green-600" />
        </button>
        <button className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
          <MapPin className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải hội thoại...
          </div>
        ) : error && messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => void refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
            >
              Thử lại
            </button>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === myId;
            return (
              <div key={msg.messageId} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                {!isMe && <Avatar size={32} name={msg.senderName} />}
                <div className={`max-w-[75%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${isMe ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white text-foreground rounded-tl-sm shadow-sm"}`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {}
      <div className="bg-white border-t border-border px-4 py-3 flex items-end gap-2">
        <div className="flex-1 flex items-end bg-muted rounded-2xl px-3 py-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            className="flex-1 bg-transparent text-sm focus:outline-none resize-none max-h-24"
            placeholder="Nhập tin nhắn..."
            rows={1}
          />
        </div>
        <button
          onClick={() => void send()}
          disabled={!input.trim() || sending}
          className={`w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 transition-colors ${input.trim() && !sending ? "bg-blue-600 hover:bg-blue-700" : "bg-muted"}`}
        >
          {sending ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Send className={`w-4 h-4 ${input.trim() ? "text-white" : "text-muted-foreground"}`} />
          )}
        </button>
      </div>
    </div>
  );
}
