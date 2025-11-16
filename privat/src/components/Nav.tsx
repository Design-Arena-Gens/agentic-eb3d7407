"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chats", label: "Chat" },
  { href: "/groups", label: "Grup" },
  { href: "/friends", label: "Teman" },
  { href: "/profile", label: "Profil" },
  { href: "/admin", label: "Admin" },
];

export function Nav({ userId }: { userId: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  return (
    <div className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-lg">
            PrivaT
          </Link>
          <nav className="hidden sm:flex items-center gap-4">
            {navItems.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`text-sm px-2 py-1 rounded ${pathname === n.href ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:text-gray-900"}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">ID: {userId}</span>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
