"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteVehicle } from "@/actions/vehicles";

export default function DeleteButton({
  vehicleId,
  vehicleName,
}: {
  vehicleId: string;
  vehicleName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Excluir "${vehicleName}"? Esta ação não pode ser desfeita.`)) return;
    setLoading(true);
    try {
      await deleteVehicle(vehicleId);
      toast.success("Veículo excluído.");
      router.refresh();
    } catch {
      toast.error("Erro ao excluir veículo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
      title="Excluir"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
    </button>
  );
}
