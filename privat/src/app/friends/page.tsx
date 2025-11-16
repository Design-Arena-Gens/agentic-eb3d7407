"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";

export default function FriendsPage() {
  const [userId, setUserId] = useState<string>("");
  const [targetId, setTargetId] = useState("");
  const [friends, setFriends] = useState<any[]>([]);
  const [incoming, setIncoming] = useState<string[]>([]);
  const [outgoing, setOutgoing] = useState<string[]>([]);

  const load = async () => {
    const me = await fetch("/api/user/me").then((r) => r.json());
    if (!me.user) {
      location.href = "/login";
      return;
    }
    setUserId(me.user.id);
    const data = await fetch("/api/friends/list").then((r) => r.json());
    setFriends(data.friends);
    setIncoming(data.incoming);
    setOutgoing(data.outgoing);
  };

  useEffect(() => {
    load();
  }, []);

  const addFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/friends/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId }),
    });
    if (!res.ok) alert("Gagal menambahkan teman");
    setTargetId("");
    load();
  };

  const accept = async (fromId: string) => {
    await fetch("/api/friends/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromId }),
    });
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav userId={userId} />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Tambah Teman</h2>
          <form onSubmit={addFriend} className="flex gap-2">
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="Masukkan ID teman"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              required
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Tambah</button>
          </form>
          <div className="text-xs text-gray-500 mt-2">ID Anda: {userId}</div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Teman</h2>
            <ul className="space-y-2">
              {friends.map((f) => (
                <li key={f.id} className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.avatarUrl || "/avatar-placeholder.svg"} className="w-8 h-8 rounded-full" alt="" />
                  <div>
                    <div className="font-medium text-sm">{f.displayName}</div>
                    <div className="text-xs text-gray-500">{f.id} ? {f.statusMessage}</div>
                  </div>
                </li>
              ))}
              {friends.length === 0 && <div className="text-sm text-gray-500">Belum ada teman.</div>}
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Permintaan Masuk</h2>
            <ul className="space-y-2">
              {incoming.map((id) => (
                <li key={id} className="flex items-center justify-between">
                  <span className="text-sm">{id}</span>
                  <button onClick={() => accept(id)} className="px-3 py-1 text-sm bg-green-600 text-white rounded">Terima</button>
                </li>
              ))}
              {incoming.length === 0 && <div className="text-sm text-gray-500">Tidak ada.</div>}
            </ul>
            <h3 className="text-md font-semibold mt-6 mb-2">Menunggu Persetujuan</h3>
            <ul className="space-y-1">
              {outgoing.map((id) => (
                <li key={id} className="text-sm text-gray-600">{id}</li>
              ))}
              {outgoing.length === 0 && <div className="text-sm text-gray-500">Tidak ada.</div>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
