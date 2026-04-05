import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat("pt-BR").format(mileage) + " km";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    AVAILABLE: "Disponível",
    RESERVED: "Reservado",
    SOLD: "Vendido",
  };
  return labels[status] || status;
}

export function getWhatsAppUrl(vehicleName: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5553984385998";
  const message = encodeURIComponent(
    `Olá, tenho interesse no veículo ${vehicleName}`
  );
  return `https://wa.me/${phone}?text=${message}`;
}
