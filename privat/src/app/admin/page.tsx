"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";

export default function AdminPage() {
  const [userId, setUserId] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const me = await fetch("/api/user/me").then((r) => r.json());
    if (!me.user) {
      location.href = "/login";
      return;
    }
    setUserId(me.user.id);
    try {
      const [u, g] = await Promise.all([
        fetch("/api/admin/users").then((r) => r.json()),
        fetch("/api/admin/groups").then((r) => r.json()),
      ]);
      if (u.error || g.error) setError(u.error || g.error);
      else {
        setUsers(u.users);
        setGroups(g.groups);
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const delUser = async (id: string) => {
    if (!confirm(`Hapus user ${id}?`)) return;
    await fetch("/api/admin/users/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };
  const delGroup = async (id: string) => {
    if (!confirm(`Hapus grup ${id}?`)) return;
    await fetch("/api/admin/groups/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav userId={userId} />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold mb-2">Pengguna</h2>
            <ul className="divide-y">
              {users.map((u) => (
                <li key={u.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{u.name} {u.isAdmin && <span className="text-xs text-blue-600">(admin)</span>}</div>
                    <div className="text-xs text-gray-500">{u.id}</div>
                  </div>
                  {!u.isAdmin && (
                    <button onClick={() => delUser(u.id)} className="text-red-600 text-sm">Hapus</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold mb-2">Grup</h2>
            <ul className="divide-y">
              {groups.map((g) => (
                <li key={g.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{g.name}</div>
                    <div className="text-xs text-gray-500">{g.id} ? {g.members} anggota</div>
                  </div>
                  <button onClick={() => delGroup(g.id)} className="text-red-600 text-sm">Hapus</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
