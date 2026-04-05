import { Suspense } from "react";
import { getVehicles } from "@/actions/vehicles";
import Navbar from "@/components/Navbar";
import VehicleCard from "@/components/VehicleCard";
import Footer from "@/components/Footer";
import { MessageCircle, Phone, MapPin, ShieldCheck, Star, Clock } from "lucide-react";

async function VehicleGrid({ status }: { status?: string }) {
  const vehicles = await getVehicles(status);

  if (vehicles.length === 0) {
    return (
      <div className="col-span-full text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🚗</span>
        </div>
        <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhum veículo encontrado</h3>
        <p className="text-gray-400">Em breve novidades no estoque!</p>
      </div>
    );
  }

  return (
    <>
      {vehicles.map((vehicle, idx) => (
        <div
          key={vehicle.id}
          className="animate-fade-in"
          style={{ animationDelay: `${idx * 0.07}s`, opacity: 0 }}
        >
          <VehicleCard vehicle={vehicle} />
        </div>
      ))}
    </>
  );
}

function GridSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
          <div className="aspect-[16/10] skeleton" />
          <div className="p-4 space-y-3">
            <div className="h-3 skeleton rounded w-1/3" />
            <div className="h-5 skeleton rounded w-4/5" />
            <div className="h-3 skeleton rounded w-1/2" />
            <div className="h-7 skeleton rounded w-1/2" />
          </div>
        </div>
      ))}
    </>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const statusFilters = [
    { value: "ALL", label: "Todos" },
    { value: "AVAILABLE", label: "Disponíveis" },
    { value: "RESERVED", label: "Reservados" },
    { value: "SOLD", label: "Vendidos" },
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="brand-gradient relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, rgba(34,197,94,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(34,197,94,0.15) 0%, transparent 50%)"
            }} />
          </div>
          <div className="container-custom py-16 md:py-24 relative">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <MapPin size={13} className="text-green-400" />
                <span className="text-white/80 text-sm font-medium">Pelotas, Rio Grande do Sul</span>
              </div>
              <h1
                className="text-white mb-4 leading-none"
                style={{
                  fontFamily: "var(--font-bebas), Impact, sans-serif",
                  fontSize: "clamp(2.8rem, 7vw, 5rem)",
                  letterSpacing: "0.02em"
                }}
              >
                SEU PRÓXIMO VEÍCULO <br />
                <span className="text-green-400">ESTÁ AQUI</span>
              </h1>
              <p className="text-white/70 text-lg mb-8 max-w-xl leading-relaxed">
                Encontre o veículo perfeito com procedência garantida e o melhor atendimento de Pelotas.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://wa.me/5553984385998?text=Olá,%20vim%20pelo%20site%20e%20gostaria%20de%20mais%20informações!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl transition-all hover:shadow-xl hover:shadow-green-500/30 hover:-translate-y-0.5"
                >
                  <MessageCircle size={18} />
                  Falar no WhatsApp
                </a>
                <a
                  href="tel:+5553984385998"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 transition-all"
                >
                  <Phone size={18} />
                  (53) 98438-5998
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-brand-secondary border-y border-brand-700">
          <div className="container-custom py-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-400" />
                <span>Procedência Garantida</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={16} className="text-green-400" />
                <span>Atendimento Premium</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-green-400" />
                <span>Resposta Rápida</span>
              </div>
            </div>
          </div>
        </section>

        {/* Vehicles section */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container-custom">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Estoque Disponível
                </h2>
                <p className="text-gray-500 mt-1">Veículos selecionados com qualidade garantida</p>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2 flex-wrap">
                {statusFilters.map((filter) => (
                  <a
                    key={filter.value}
                    href={filter.value === "ALL" ? "/" : `/?status=${filter.value}`}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      (status === filter.value || (!status && filter.value === "ALL"))
                        ? "bg-brand-primary text-white shadow-sm"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {filter.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Suspense fallback={<GridSkeleton />}>
                <VehicleGrid status={status} />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Contact / CTA */}
        <section id="contato" className="py-16 brand-gradient">
          <div className="container-custom text-center">
            <h2
              className="text-white mb-3"
              style={{
                fontFamily: "var(--font-bebas), Impact, sans-serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                letterSpacing: "0.05em"
              }}
            >
              FICOU COM ALGUMA DÚVIDA?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-lg mx-auto">
              Entre em contato pelo WhatsApp ou telefone. Respondemos rapidinho!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="https://wa.me/5553984385998?text=Olá,%20vim%20pelo%20site%20e%20tenho%20uma%20dúvida!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:shadow-xl hover:shadow-green-500/30"
              >
                <MessageCircle size={20} />
                Falar no WhatsApp
              </a>
              <a
                href="tel:+5553984385998"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/20 transition-all"
              >
                <Phone size={20} />
                (53) 98438-5998
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
