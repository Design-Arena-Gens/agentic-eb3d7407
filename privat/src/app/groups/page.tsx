"use client";

import { useEffect, useRef, useState } from "react";
import { Nav } from "@/components/Nav";

interface Message {
  id: string;
  fromUserId: string;
  groupId?: string;
  type: "text" | "image" | "file";
  text?: string;
  mediaUrl?: string;
  fileName?: string;
  createdAt: number;
}

export default function GroupsPage() {
  const [userId, setUserId] = useState<string>("");
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [lastTs, setLastTs] = useState<number | undefined>(undefined);
  const [newGroup, setNewGroup] = useState("");
  const [joinId, setJoinId] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const loadGroups = async () => {
    const me = await fetch("/api/user/me").then((r) => r.json());
    if (!me.user) {
      location.href = "/login";
      return;
    }
    setUserId(me.user.id);
    const data = await fetch("/api/groups/list").then((r) => r.json());
    setGroups(data.groups);
  };

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    const t = setInterval(async () => {
      if (!selected) return;
      const res = await fetch("/api/groups/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: selected, since: lastTs }),
      });
      const data = await res.json();
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        setMessages((prev) => [...prev, ...data.messages]);
        setLastTs(data.messages[data.messages.length - 1].createdAt);
        setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }), 50);
      }
    }, 1500);
    return () => clearInterval(t);
  }, [selected, lastTs]);

  const selectGroup = (id: string) => {
    setSelected(id);
    setMessages([]);
    setLastTs(undefined);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/groups/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroup }),
    });
    const data = await res.json();
    if (res.ok) {
      setNewGroup("");
      await loadGroups();
      selectGroup(data.group.id);
      alert(`ID Grup: ${data.group.id}`);
    }
  };

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: joinId }),
    });
    if (res.ok) {
      setJoinId("");
      await loadGroups();
      selectGroup(joinId);
    }
  };

  const sendText = async () => {
    if (!input.trim() || !selected) return;
    const res = await fetch("/api/groups/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: selected, type: "text", text: input.trim() }),
    });
    if (res.ok) setInput("");
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await fetch("/api/groups/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: selected, type, mediaUrl: reader.result, fileName: file.name }),
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav userId={userId} />
      <div className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-2">Grup Anda</h3>
            <ul className="space-y-1">
              {groups.map((g) => (
                <li key={g.id}>
                  <button
                    className={`w-full text-left text-sm px-2 py-1 rounded ${selected === g.id ? "bg-blue-50" : "hover:bg-gray-50"}`}
                    onClick={() => selectGroup(g.id)}
                  >
                    {g.name} <span className="text-gray-500">({g.id})</span>
                  </button>
                </li>
              ))}
              {groups.length === 0 && <div className="text-sm text-gray-500">Belum ada grup.</div>}
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-2">Buat Grup</h3>
            <form onSubmit={create} className="flex gap-2">
              <input className="flex-1 border rounded px-3 py-2" value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="Nama grup" required />
              <button className="px-3 py-2 bg-blue-600 text-white rounded">Buat</button>
            </form>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-2">Masuk Grup</h3>
            <form onSubmit={join} className="flex gap-2">
              <input className="flex-1 border rounded px-3 py-2" value={joinId} onChange={(e) => setJoinId(e.target.value)} placeholder="ID grup" required />
              <button className="px-3 py-2 border rounded">Masuk</button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl shadow h-[70vh] flex flex-col">
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
            <button onClick={sendText} className="px-3 py-2 bg-blue-600 text-white rounded">Kirim</button>
            <label className="px-3 py-2 border rounded cursor-pointer">Gambar
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(e, "image")} />
            </label>
            <label className="px-3 py-2 border rounded cursor-pointer">Dokumen
              <input type="file" className="hidden" onChange={(e) => onUpload(e, "file")} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
