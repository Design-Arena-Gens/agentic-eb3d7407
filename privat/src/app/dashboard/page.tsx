import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/db";
import { Nav } from "@/components/Nav";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.userId) return <RedirectToLogin />;
  const user = findUserById(session.userId);
  if (!user) return <RedirectToLogin />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav userId={user.id} />
      <main className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
        <section className="md:col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Selamat datang, {user.profile.displayName}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <CardLink href="/chats" title="Chat Pribadi" desc="Kirim pesan 1-on-1 via ID" />
            <CardLink href="/groups" title="Grup" desc="Buat / masuk grup dan chat" />
            <CardLink href="/friends" title="Teman" desc="Tambah teman & lihat status" />
            <CardLink href="/profile" title="Profil" desc="Ubah nama, foto, status, privasi" />
          </div>
        </section>
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Notifikasi</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>Permintaan pertemanan: {user.incomingRequests.size}</li>
            <li>Teman: {user.friends.size}</li>
            <li>Grup gabung: {/* computed client-side later */}?</li>
          </ul>
          {user.isAdmin && (
            <Link className="inline-block mt-4 text-blue-600 hover:underline" href="/admin">
              Buka Admin Panel
            </Link>
          )}
        </section>
      </main>
    </div>
  );
}

function CardLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="block border rounded-lg p-4 hover:border-blue-400">
      <div className="font-medium">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </Link>
  );
}

function RedirectToLogin() {
  return (
    <html>
      <head>
        <meta httpEquiv="refresh" content="0; url=/login" />
      </head>
      <body />
    </html>
  );
}
