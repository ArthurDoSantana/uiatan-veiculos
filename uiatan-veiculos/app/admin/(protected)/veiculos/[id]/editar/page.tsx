import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getVehicleById } from "@/actions/vehicles";
import VehicleForm from "@/components/VehicleForm";

export default async function EditarVeiculoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);

  if (!vehicle) notFound();

  return (
    <div className="flex-1 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-primary text-sm font-medium mb-4 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Voltar ao dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Veículo</h1>
        <p className="text-gray-500 mt-0.5 truncate max-w-md">
          {vehicle.name}
        </p>
      </div>

      <div className="max-w-3xl">
        <VehicleForm vehicle={vehicle} />
      </div>
    </div>
  );
}
