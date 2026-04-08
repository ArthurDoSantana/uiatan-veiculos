"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, PlusCircle, Search, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Veículos",
    href: "/admin/dashboard",
    icon: Car,
  },
  {
    label: "Novo Veículo",
    href: "/admin/veiculos/novo",
    icon: PlusCircle,
  },
  {
    label: "Consulta FIPE",
    href: "/admin/fipe",
    icon: Search,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full min-h-screen bg-brand-dark flex flex-col border-r border-white/10">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden ring-2 ring-white/20">
            <Image
              src="/logo.jpg"
              alt="Uiatan Veículos"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Uiatan Veículos</p>
            <p className="text-white/40 text-xs">Painel Admin</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <Car size={18} />
          Ver Site
        </Link>
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
