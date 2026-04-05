import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div
            className="text-9xl font-bold text-brand-primary/10 mb-4 select-none"
            style={{ fontFamily: "var(--font-bebas), sans-serif", fontSize: "12rem" }}
          >
            404
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            O veículo ou página que você procura não existe mais ou foi removido.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-brand-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-secondary transition-all"
            >
              <Home size={18} />
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
