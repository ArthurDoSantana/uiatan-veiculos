import { notFound } from "next/navigation";
import Link from "next/link";
import { getVehicleById } from "@/actions/vehicles";
import Navbar from "@/components/Navbar";
import VehicleGallery from "@/components/VehicleGallery";
import StatusBadge from "@/components/StatusBadge";
import Footer from "@/components/Footer";
import { formatPrice, formatMileage, getWhatsAppUrl } from "@/lib/utils";
import {
  MessageCircle,
  Phone,
  ArrowLeft,
  Calendar,
  Gauge,
  Palette,
  Tag,
  CheckCircle2,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);
  if (!vehicle) return { title: "Veículo não encontrado" };
  return {
    title: `${vehicle.name} — Uiatan Veículos`,
    description: vehicle.description || `${vehicle.name} à venda na Uiatan Veículos, Canguçu RS`,
  };
}

export default async function VehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) notFound();

  const whatsappUrl = getWhatsAppUrl(vehicle.name);
  const isAvailable = vehicle.status === "AVAILABLE";

  const specs = [
    { icon: Calendar, label: "Ano", value: vehicle.year?.toString() },
    { icon: Gauge, label: "Quilometragem", value: vehicle.mileage ? formatMileage(vehicle.mileage) : null },
    { icon: Palette, label: "Cor", value: vehicle.color },
    { icon: Tag, label: "Marca", value: vehicle.brand },
  ].filter((s) => s.value);

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="container-custom py-6 md:py-10">
          {/* Breadcrumb */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-primary text-sm font-medium mb-6 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Voltar ao estoque
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Gallery — left/top */}
            <div className="lg:col-span-3">
              <VehicleGallery images={vehicle.images} />
            </div>

            {/* Info panel — right/bottom */}
            <div className="lg:col-span-2 space-y-5">
              {/* Header card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    {vehicle.brand && (
                      <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
                        {vehicle.brand}
                      </p>
                    )}
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                      {vehicle.name}
                    </h1>
                  </div>
                  <StatusBadge status={vehicle.status} size="md" />
                </div>

                {/* Price */}
                <div className="py-4 border-t border-b border-gray-100 my-4">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Preço</p>
                  <p className="text-4xl font-bold text-brand-primary">
                    {formatPrice(vehicle.price)}
                  </p>
                </div>

                {/* CTA buttons */}
                <div className="space-y-3">
                  {isAvailable ? (
                    <>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2.5 bg-green-500 hover:bg-green-400 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5"
                      >
                        <MessageCircle size={20} />
                        Tenho interesse — WhatsApp
                      </a>
                      <a
                        href="tel:+5553984385998"
                        className="w-full flex items-center justify-center gap-2.5 bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-3 rounded-xl transition-all"
                      >
                        <Phone size={18} />
                        Ligar agora
                      </a>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 font-medium mb-3">
                        {vehicle.status === "RESERVED"
                          ? "Este veículo está reservado. Entre em contato para mais informações."
                          : "Este veículo já foi vendido."}
                      </p>
                      <a
                        href="https://wa.me/5553984385998?text=Olá,%20vi%20que%20o%20veículo%20está%20reservado/vendido.%20Vocês%20têm%20outros%20similares?"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-xl transition-all"
                      >
                        <MessageCircle size={18} />
                        Ver outros veículos
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Specs */}
              {specs.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 mb-4">Especificações</h2>
                  <div className="space-y-3">
                    {specs.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Icon size={15} />
                          {label}
                        </div>
                        <span className="font-semibold text-gray-800 text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust badges */}
              <div className="bg-brand-50 rounded-2xl border border-brand-100 p-4">
                <div className="space-y-2.5">
                  {[
                    "Documentação verificada",
                    "Histórico conferido",
                    "Atendimento personalizado",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-brand-800">
                      <CheckCircle2 size={15} className="text-brand-600 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {vehicle.description && (
            <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <h2 className="font-bold text-gray-900 text-xl mb-4">Sobre este veículo</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {vehicle.description}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
