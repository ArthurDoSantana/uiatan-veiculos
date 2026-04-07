import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:self-stretch shrink-0">
        <AdminSidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden bg-brand-primary px-4 py-3 flex items-center justify-between">
          <span
            className="text-white font-bold"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em", fontSize: "1.3rem" }}
          >
            UIATAN VEÍCULOS
          </span>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-white/80 hover:text-white font-medium transition-colors">
              Ver Loja
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-white/60 hover:text-white transition-colors">
                Sair
              </button>
            </form>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
