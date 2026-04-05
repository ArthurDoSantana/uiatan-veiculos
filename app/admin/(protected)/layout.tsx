import AdminSidebar from "@/components/AdminSidebar";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden bg-brand-primary px-4 py-3 flex items-center justify-between">
          <span
            className="text-white font-bold"
            style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em", fontSize: "1.3rem" }}
          >
            UIATAN VEÍCULOS
          </span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-white/60 hover:text-white text-sm">
              Sair
            </button>
          </form>
        </div>
        {children}
      </div>
    </div>
  );
}
