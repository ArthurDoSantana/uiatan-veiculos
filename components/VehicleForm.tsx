"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X, Loader2, Save, Car, DollarSign } from "lucide-react";
import { createVehicle, updateVehicle } from "@/actions/vehicles";

interface VehicleFormProps {
  vehicle?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    costPrice: number | null;
    status: string;
    year: number | null;
    brand: string | null;
    mileage: number | null;
    color: string | null;
    plate: string | null;
    images: { id: string; url: string }[];
  };
}

export default function VehicleForm({ vehicle }: VehicleFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(
    vehicle?.images.map((i) => i.url) || []
  );
  const [form, setForm] = useState({
    name: vehicle?.name || "",
    description: vehicle?.description || "",
    price: vehicle?.price?.toString() || "",
    costPrice: vehicle?.costPrice?.toString() || "",
    status: vehicle?.status || "AVAILABLE",
    year: vehicle?.year?.toString() || "",
    brand: vehicle?.brand || "",
    mileage: vehicle?.mileage?.toString() || "",
    color: vehicle?.color || "",
    plate: vehicle?.plate || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);

    try {
      const uploadResults = await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            const data = (await res.json()) as { url?: string; error?: string };
            if (!res.ok || !data.url) {
              throw new Error(data.error || "Falha no upload.");
            }

            return data.url;
          } catch {
            toast.error(`Erro ao enviar ${file.name}`);
            return null;
          }
        })
      );

      const newUrls = uploadResults.filter((url): url is string => Boolean(url));
      if (newUrls.length > 0) {
        setImageUrls((prev) => [...prev, ...newUrls]);
      }
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.price) {
      toast.error("Preencha nome e preço.");
      return;
    }

    setLoading(true);
    try {
      const data = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        costPrice: form.costPrice ? parseFloat(form.costPrice) : undefined,
        status: form.status as "AVAILABLE" | "RESERVED" | "SOLD",
        year: form.year ? parseInt(form.year) : undefined,
        brand: form.brand || undefined,
        mileage: form.mileage ? parseInt(form.mileage) : undefined,
        color: form.color || undefined,
        plate: form.plate
          ? form.plate.toUpperCase().replace(/[^A-Z0-9]/g, "")
          : undefined,
        imageUrls,
      };

      if (vehicle) {
        await updateVehicle(vehicle.id, data);
        toast.success("Veículo atualizado com sucesso!");
      } else {
        await createVehicle(data);
        toast.success("Veículo cadastrado com sucesso!");
      }

      router.push("/admin/dashboard");
    } catch (err) {
      toast.error("Erro ao salvar veículo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const margin = form.price && form.costPrice
    ? parseFloat(form.price) - parseFloat(form.costPrice)
    : null;

  const marginPct = margin !== null && parseFloat(form.costPrice) > 0
    ? (margin / parseFloat(form.costPrice)) * 100
    : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Car size={20} className="text-brand-primary" />
          Informações do Veículo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Nome do Veículo *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ex: Toyota Hilux SRX 2023"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Marca
            </label>
            <input
              type="text"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="Ex: Toyota"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Ano
            </label>
            <input
              type="number"
              name="year"
              value={form.year}
              onChange={handleChange}
              placeholder="Ex: 2023"
              min="1960"
              max="2030"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Placa
            </label>
            <input
              type="text"
              name="plate"
              value={form.plate}
              onChange={handleChange}
              placeholder="ABC1234 ou ABC1D23"
              maxLength={8}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Quilometragem
            </label>
            <input
              type="number"
              name="mileage"
              value={form.mileage}
              onChange={handleChange}
              placeholder="Ex: 45000"
              min="0"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Cor
            </label>
            <input
              type="text"
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder="Ex: Branco Pérola"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Status *
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all bg-white"
            >
              <option value="AVAILABLE">✅ Disponível</option>
              <option value="RESERVED">🟡 Reservado</option>
              <option value="SOLD">🔴 Vendido</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Descrição
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descreva o veículo: opcionais, estado de conservação, diferenciais..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Prices */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <DollarSign size={20} className="text-brand-primary" />
          Controle de Valores
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Preço de Custo (R$)
            </label>
            <input
              type="number"
              name="costPrice"
              value={form.costPrice}
              onChange={handleChange}
              placeholder="Ex: 120000"
              min="0"
              step="100"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Preço de Venda (R$) *
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Ex: 149900"
              required
              min="0"
              step="100"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        {margin !== null && marginPct !== null && (
          <div
            className={`mt-4 flex items-center gap-2.5 p-3 rounded-xl text-sm font-semibold border ${
              margin >= 0
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {margin >= 0 ? "Lucro" : "Prejuizo"}: R$ {Math.abs(margin).toLocaleString("pt-BR", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
            ({margin >= 0 ? "+" : ""}{marginPct.toFixed(1)}%)
          </div>
        )}

        <p className="text-xs text-gray-400 mt-3">
          O valor FIPE pode ser consultado no Dashboard apos salvar o veiculo.
        </p>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Upload size={20} className="text-brand-primary" />
          Fotos do Veículo
        </h2>

        {/* Upload area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand-primary/50 hover:bg-brand-50/50 transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          {uploadingImages ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
              <p className="text-sm text-gray-500">Enviando imagens...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                <Upload size={22} className="text-brand-primary" />
              </div>
              <p className="font-semibold text-gray-700">Clique para enviar fotos</p>
              <p className="text-sm text-gray-400">PNG, JPG, WEBP — múltiplos arquivos aceitos</p>
            </div>
          )}
        </div>

        {/* Image preview grid */}
        {imageUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100">
                <Image
                  src={url}
                  alt={`Imagem ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="150px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1.5 rounded-full transition-all hover:bg-red-600 shadow-lg"
                  >
                    <X size={14} />
                  </button>
                </div>
                {idx === 0 && (
                  <div className="absolute bottom-1 left-1 bg-brand-primary text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold px-8 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-brand-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          {loading ? "Salvando..." : vehicle ? "Salvar Alterações" : "Cadastrar Veículo"}
        </button>
      </div>
    </form>
  );
}
