import Link from "next/link";
import { MapPin, Phone, MessageCircle, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-dark border-t border-white/10">
      <div className="container-custom py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3
              className="text-white text-xl mb-2"
              style={{
                fontFamily: "var(--font-bebas), sans-serif",
                letterSpacing: "0.05em",
                fontSize: "1.5rem",
              }}
            >
              UIATAN VEÍCULOS
            </h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Veículos selecionados com procedência e qualidade garantida em Pelotas, RS.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              Menu
            </h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Ver Estoque
                </Link>
              </li>
              <li>
                <Link href="/#contato" className="hover:text-white transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
              Contato
            </h4>
            <ul className="space-y-2.5 text-white/50 text-sm">
              <li>
                <a
                  href="tel:+5553984385998"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone size={14} />
                  (53) 98438-5998
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5553984385998"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <MessageCircle size={14} />
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} />
                Pelotas, Rio Grande do Sul
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-white/30 text-xs">
          <p>© {new Date().getFullYear()} Uiatan Veículos. Todos os direitos reservados.</p>
          <Link href="/admin/login" className="hover:text-white/50 transition-colors">
            Área Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
