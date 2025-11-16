"use client";

import { useEffect, useRef, useState } from "react";
import { Nav } from "@/components/Nav";
import { CallWidget } from "@/components/CallWidget";

interface Message {
  id: string;
  fromUserId: string;
  toUserId?: string;
  type: "text" | "image" | "file";
  text?: string;
  mediaUrl?: string;
  fileName?: string;
  createdAt: number;
}

export default function ChatsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [lastTs, setLastTs] = useState<number | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);
  const [showCall, setShowCall] = useState<null | { mode: "audio" | "video" }>(null);

  useEffect(() => {
    (async () => {
      const me = await fetch("/api/user/me").then((r) => r.json());
      if (!me.user) {
        location.href = "/login";
        return;
      }
      setUserId(me.user.id);
    })();
  }, []);

  useEffect(() => {
    const t = setInterval(async () => {
      if (!partnerId) return;
      const res = await fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId, since: lastTs }),
      });
      const data = await res.json();
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        setMessages((prev) => [...prev, ...data.messages]);
        setLastTs(data.messages[data.messages.length - 1].createdAt);
        setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }), 50);
      }
    }, 1500);
    return () => clearInterval(t);
  }, [partnerId, lastTs]);

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessages([]);
    setLastTs(undefined);
  };

  const sendText = async () => {
    if (!input.trim() || !partnerId) return;
    const res = await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toId: partnerId, type: "text", text: input.trim() }),
    });
    if (res.ok) setInput("");
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const file = e.target.files?.[0];
    if (!file || !partnerId) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toId: partnerId, type, mediaUrl: reader.result, fileName: file.name }),
      });
    };
    if (type === "image") reader.readAsDataURL(file);
    else reader.readAsDataURL(file); // store as data URL for demo
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav userId={userId || ""} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <form onSubmit={startChat} className="flex gap-2 mb-4">
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="Masukkan ID lawan chat (contoh: PTXXXX)"
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            required
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Buka</button>
        </form>

        <div className="bg-white rounded-xl shadow h-[60vh] flex flex-col">
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`max-w-[70%] ${m.fromUserId === userId ? "ml-auto" : ""}`}>
                <div className={`rounded-lg p-2 border ${m.fromUserId === userId ? "bg-blue-50 border-blue-200" : "bg-gray-50"}`}>
                  {m.type === "text" && <div>{m.text}</div>}
                  {m.type === "image" && (
                    <a href={m.mediaUrl} target="_blank" rel="noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.mediaUrl} alt={m.fileName || "image"} className="max-h-64 rounded" />
                    </a>
                  )}
                  {m.type === "file" && (
                    <a className="text-blue-600 hover:underline" href={m.mediaUrl} download={m.fileName || "file"}>
                      {m.fileName || "Unduh dokumen"}
                    </a>
                  )}
                  <div className="text-[10px] text-gray-500 mt-1">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-3 flex items-center gap-2">
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="Tulis pesan"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendText();
                }
              }}
            />
            <button onClick={sendText} className="px-3 py-2 bg-blue-600 text-white rounded">
              Kirim
            </button>
            <label className="px-3 py-2 border rounded cursor-pointer">Gambar
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e, "image")} />
            </label>
            <label className="px-3 py-2 border rounded cursor-pointer">Dokumen
              <input type="file" className="hidden" onChange={(e) => onUpload(e, "file")} />
            </label>
            <button disabled={!partnerId} onClick={() => setShowCall({ mode: "audio" })} className="px-3 py-2 border rounded disabled:opacity-50">?? Suara</button>
            <button disabled={!partnerId} onClick={() => setShowCall({ mode: "video" })} className="px-3 py-2 border rounded disabled:opacity-50">?? Video</button>
          </div>
        </div>
      </div>
      {showCall && userId && partnerId && (
        <CallWidget
          selfId={userId}
          peerId={partnerId}
          mode={showCall.mode}
          onClose={() => setShowCall(null)}
        />
      )}
    </div>
  );
}
