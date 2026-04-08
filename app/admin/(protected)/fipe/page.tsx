import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getVehicles } from "@/actions/vehicles";
import FipeConsultaRapida from "@/components/FipeConsultaRapida";

export default async function AdminFipePage() {
  const vehicles = await getVehicles();

  const vehicleOptions = vehicles.map((vehicle) => ({
    id: vehicle.id,
    name: vehicle.name,
    price: vehicle.price,
    costPrice: vehicle.costPrice,
  }));

  return (
    <div className="flex-1 p-6 md:p-8">
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-primary text-sm font-medium mb-4 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Voltar ao dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Consulta FIPE</h1>
        <p className="text-gray-500 mt-0.5">Consulte FIPE de qualquer veiculo e salve no estoque quando quiser.</p>
      </div>

      <div className="max-w-5xl">
        <FipeConsultaRapida vehicles={vehicleOptions} />
      </div>
    </div>
  );
}
