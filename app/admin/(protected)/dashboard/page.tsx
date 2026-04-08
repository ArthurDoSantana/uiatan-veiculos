import Link from "next/link";
import Image from "next/image";
import { getVehicles, getAdminStats } from "@/actions/vehicles";
import { formatPrice } from "@/lib/utils";
import {
  PlusCircle,
  Search,
  Car,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckCircle,
  Pencil,
} from "lucide-react";
import DeleteButton from "./DeleteButton";
import StatusSelect from "./StatusSelect";

export default async function DashboardPage() {
  const [vehicles, stats] = await Promise.all([getVehicles(), getAdminStats()]);

  const statCards = [
    { label: "Total", value: stats.total, icon: Car, color: "bg-blue-50 text-blue-700" },
    { label: "Disponíveis", value: stats.available, icon: CheckCircle, color: "bg-emerald-50 text-emerald-700" },
    { label: "Reservados", value: stats.reserved, icon: Clock, color: "bg-amber-50 text-amber-700" },
    { label: "Vendidos", value: stats.sold, icon: TrendingUp, color: "bg-red-50 text-red-700" },
  ];

  return (
    <div className="flex-1 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-0.5">Gerencie seu estoque de veículos</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/fipe"
            className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:text-brand-primary hover:border-brand-primary bg-white font-semibold px-4 py-2.5 rounded-xl transition-all"
          >
            <Search size={18} />
            Consulta FIPE
          </Link>
          <Link
            href="/admin/veiculos/novo"
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-brand-primary/20"
          >
            <PlusCircle size={18} />
            Novo Veículo
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-gray-500 text-sm mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Vehicles table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Todos os Veículos</h2>
          <span className="text-sm text-gray-400">{vehicles.length} veículo(s)</span>
        </div>

        {vehicles.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium mb-4">Nenhum veículo cadastrado</p>
            <Link
              href="/admin/veiculos/novo"
              className="inline-flex items-center gap-2 bg-brand-primary text-white font-semibold px-5 py-2.5 rounded-xl"
            >
              <PlusCircle size={16} />
              Cadastrar primeiro veículo
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left px-5 py-3">Veículo</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Custo</th>
                  <th className="text-left px-5 py-3">Anúncio</th>
                  <th className="text-left px-5 py-3 hidden xl:table-cell">FIPE</th>
                  <th className="text-left px-5 py-3 hidden lg:table-cell">Margem</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vehicles.map((vehicle) => {
                  const costPrice = vehicle.costPrice;
                  const hasCost = costPrice !== null;
                  const margin = hasCost ? vehicle.price - costPrice : null;
                  const marginPct = hasCost && costPrice > 0
                    ? ((vehicle.price - costPrice) / costPrice) * 100
                    : null;

                  const fipePrice = vehicle.fipePrice;
                  const hasFipe = fipePrice !== null;
                  const fipeDiff = hasFipe ? vehicle.price - fipePrice : null;

                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {vehicle.images[0] ? (
                              <Image
                                src={vehicle.images[0].url}
                                alt={vehicle.name}
                                width={48}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-brand-50 flex items-center justify-center">
                                <Car size={16} className="text-brand-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                              {vehicle.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {vehicle.plate && (
                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 mr-1">
                                  {vehicle.plate}
                                </span>
                              )}
                              {vehicle.year && `${vehicle.year} · `}
                              {vehicle.images.length} foto(s)
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 hidden md:table-cell">
                        {hasCost ? (
                          <span className="font-semibold text-gray-700 text-sm">
                            {formatPrice(costPrice)}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-sm">-</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-bold text-brand-primary text-sm">
                          {formatPrice(vehicle.price)}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 hidden xl:table-cell">
                        {hasFipe ? (
                          <div>
                            <span className="font-semibold text-blue-600 text-sm">
                              {formatPrice(fipePrice)}
                            </span>
                            {fipeDiff !== null && (
                              <div
                                className={`text-xs mt-0.5 flex items-center gap-0.5 ${
                                  fipeDiff > 0
                                    ? "text-red-500"
                                    : fipeDiff < 0
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {fipeDiff > 0 ? (
                                  <TrendingUp size={11} />
                                ) : fipeDiff < 0 ? (
                                  <TrendingDown size={11} />
                                ) : (
                                  <Minus size={11} />
                                )}
                                {fipeDiff > 0 ? "+" : ""}
                                {formatPrice(fipeDiff)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-sm">-</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        {margin !== null && marginPct !== null ? (
                          <div
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                              margin >= 0
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {margin >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {margin >= 0 ? "+" : ""}
                            {marginPct.toFixed(1)}%
                          </div>
                        ) : (
                          <span className="text-gray-300 text-sm">-</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <StatusSelect
                          vehicleId={vehicle.id}
                          currentStatus={vehicle.status}
                        />
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={`/admin/veiculos/${vehicle.id}/editar`}
                            className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-50 rounded-lg transition-all"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </Link>
                          <DeleteButton vehicleId={vehicle.id} vehicleName={vehicle.name} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
