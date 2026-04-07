"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, MessageCircle, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const whatsappUrl = `https://wa.me/5553984385998?text=Olá,%20vim%20pelo%20site%20e%20gostaria%20de%20mais%20informações!`;

  return (
    <header className="sticky top-0 z-50 bg-brand-primary/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-white/20 group-hover:ring-white/40 transition-all">
              <Image
                src="/logo.jpg"
                alt="Uiatan Veículos Logo"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <span
                className="text-white font-bold text-lg leading-tight block"
                style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em", fontSize: "1.4rem" }}
              >
                Uiatan Veículos
              </span>
              <span className="text-white/60 text-xs">Canguçu • RS</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-white/80 hover:text-white font-medium text-sm transition-colors"
            >
              Estoque
            </Link>
            <Link
              href="/#contato"
              className="text-white/80 hover:text-white font-medium text-sm transition-colors"
            >
              Contato
            </Link>
          </nav>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={`tel:+5553984385998`}
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
            >
              <Phone size={15} />
              <span>(53) 98438-5998</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:shadow-lg hover:shadow-green-500/30"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-3 animate-fade-in">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block text-white/80 hover:text-white font-medium py-2"
            >
              Ver Estoque
            </Link>
            <a
              href={`tel:+5553984385998`}
              className="flex items-center gap-2 text-white/70 hover:text-white py-2"
            >
              <Phone size={15} />
              (53) 98438-5998
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white font-semibold px-4 py-2.5 rounded-lg w-full justify-center"
            >
              <MessageCircle size={16} />
              Falar no WhatsApp
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
