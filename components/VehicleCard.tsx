import Link from "next/link";
import Image from "next/image";
import { Calendar, Gauge, ArrowRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatPrice, formatMileage } from "@/lib/utils";

interface Image {
  id: string;
  url: string;
}

interface Vehicle {
  id: string;
  name: string;
  description: string | null;
  price: number;
  status: string;
  year: number | null;
  brand: string | null;
  mileage: number | null;
  color: string | null;
  images: Image[];
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const mainImage = vehicle.images[0]?.url;
  const isSold = vehicle.status === "SOLD";

  return (
    <Link href={`/veiculo/${vehicle.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 border border-gray-100">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={vehicle.name}
              fill
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                isSold ? "grayscale opacity-70" : ""
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary">
              <span className="text-white/40 text-4xl font-display tracking-wider">
                UV
              </span>
            </div>
          )}

          {/* Status badge overlay */}
          <div className="absolute top-3 left-3">
            <StatusBadge status={vehicle.status} size="sm" />
          </div>

          {/* Image count */}
          {vehicle.images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
              {vehicle.images.length} fotos
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {vehicle.brand && (
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
              {vehicle.brand}
            </p>
          )}
          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-3 group-hover:text-brand-primary transition-colors line-clamp-1">
            {vehicle.name}
          </h3>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
            {vehicle.year && (
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {vehicle.year}
              </span>
            )}
            {vehicle.mileage && (
              <span className="flex items-center gap-1">
                <Gauge size={13} />
                {formatMileage(vehicle.mileage)}
              </span>
            )}
            {vehicle.color && (
              <span className="text-gray-400 text-xs">• {vehicle.color}</span>
            )}
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium">Preço</p>
              <p className="text-2xl font-bold text-brand-primary">
                {formatPrice(vehicle.price)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white group-hover:bg-brand-secondary transition-colors shadow-md">
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
