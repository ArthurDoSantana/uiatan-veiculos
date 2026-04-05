"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateVehicleStatus } from "@/actions/vehicles";

const statusOptions = [
  { value: "AVAILABLE", label: "Disponível", emoji: "✅" },
  { value: "RESERVED", label: "Reservado", emoji: "🟡" },
  { value: "SOLD", label: "Vendido", emoji: "🔴" },
];

export default function StatusSelect({
  vehicleId,
  currentStatus,
}: {
  vehicleId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as "AVAILABLE" | "RESERVED" | "SOLD";
    const prev = status;
    setStatus(newStatus);
    setLoading(true);
    try {
      await updateVehicleStatus(vehicleId, newStatus);
      toast.success("Status atualizado!");
      router.refresh();
    } catch {
      setStatus(prev);
      toast.error("Erro ao atualizar status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className="text-xs font-semibold border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:opacity-60 cursor-pointer transition-all"
    >
      {statusOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.emoji} {opt.label}
        </option>
      ))}
    </select>
  );
}
