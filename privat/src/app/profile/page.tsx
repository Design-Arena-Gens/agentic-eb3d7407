"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Me {
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    statusMessage: string;
    isPrivate: boolean;
    isAdmin: boolean;
  } | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me["user"] | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/user/me");
      const data: Me = await res.json();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setMe(data.user);
      setDisplayName(data.user.displayName);
      setStatusMessage(data.user.statusMessage);
      setIsPrivate(data.user.isPrivate);
      setAvatarUrl(data.user.avatarUrl);
    })();
  }, [router]);

  const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    setSaving(true);
    await fetch("/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, statusMessage, isPrivate, avatarUrl }),
    });
    setSaving(false);
    alert("Profil disimpan.");
  };

  if (!me) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Profil</h1>
        <div className="flex gap-6 items-start">
          <div className="flex flex-col items-center">
            <img
              src={avatarUrl || "/avatar-placeholder.svg"}
              className="w-24 h-24 rounded-full object-cover border"
              alt="avatar"
            />
            <input type="file" accept="image/*" className="mt-3" onChange={onAvatarChange} />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder="Apa kabar?"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="private"
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <label htmlFor="private">Privasi akun (butuh persetujuan pertemanan)</label>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 rounded border"
          >
            Kembali
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
