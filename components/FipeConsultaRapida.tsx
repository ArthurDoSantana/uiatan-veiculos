"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Search, TrendingDown, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type FipeTipo = "carros" | "motos" | "caminhoes";

type VehicleSummary = {
  id: string;
  name: string;
  price: number;
  costPrice: number | null;
};

interface FipeConsultaRapidaProps {
  vehicles: VehicleSummary[];
}

interface PlateData {
  [key: string]: unknown;
}

interface FipeOption {
  nome: string;
  valor: string;
}

interface FipePriceResult {
  valor: string;
  marca: string;
  modelo: string;
  anoModelo: number;
  combustivel: string;
  codigoFipe: string;
  mesReferencia: string;
}

function parseBrlValue(value: string): number {
  return Number(value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  const json = (await res.json()) as T & { error?: string };

  if (!res.ok) {
    throw new Error(json.error || "Falha na consulta.");
  }

  return json;
}

export default function FipeConsultaRapida({ vehicles }: FipeConsultaRapidaProps) {
  const router = useRouter();

  const [tab, setTab] = useState<"manual" | "placa">("manual");

  const [tipo, setTipo] = useState<FipeTipo>("carros");
  const [marcas, setMarcas] = useState<FipeOption[]>([]);
  const [marcaSel, setMarcaSel] = useState("");
  const [modelos, setModelos] = useState<FipeOption[]>([]);
  const [modeloSel, setModeloSel] = useState("");
  const [anos, setAnos] = useState<FipeOption[]>([]);
  const [anoSel, setAnoSel] = useState("");

  const [loadingMarcas, setLoadingMarcas] = useState(false);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [loadingAnos, setLoadingAnos] = useState(false);
  const [loadingFipe, setLoadingFipe] = useState(false);

  const [fipeResult, setFipeResult] = useState<FipePriceResult | null>(null);
  const [saving, setSaving] = useState(false);

  const [vehicleSel, setVehicleSel] = useState("");

  const [plate, setPlate] = useState("");
  const [plateData, setPlateData] = useState<PlateData | null>(null);
  const [loadingPlate, setLoadingPlate] = useState(false);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === vehicleSel) || null,
    [vehicleSel, vehicles]
  );

  const fipeValue = fipeResult ? parseBrlValue(fipeResult.valor) : null;

  useEffect(() => {
    void carregarMarcas("carros");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarMarcas = async (tipoSelecionado: FipeTipo) => {
    setLoadingMarcas(true);
    setMarcas([]);
    setMarcaSel("");
    setModelos([]);
    setModeloSel("");
    setAnos([]);
    setAnoSel("");
    setFipeResult(null);

    try {
      const json = await fetchJson<{ success: boolean; data: FipeOption[] }>(
        `/api/fipe?action=marcas&tipo=${tipoSelecionado}`
      );
      setMarcas(json.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar marcas.");
    } finally {
      setLoadingMarcas(false);
    }
  };

  const handleTipo = (nextTipo: FipeTipo) => {
    setTipo(nextTipo);
    void carregarMarcas(nextTipo);
  };

  const handleMarca = async (value: string) => {
    setMarcaSel(value);
    setModelos([]);
    setModeloSel("");
    setAnos([]);
    setAnoSel("");
    setFipeResult(null);

    if (!value) return;

    setLoadingModelos(true);
    try {
      const json = await fetchJson<{ success: boolean; data: { modelos: FipeOption[] } }>(
        `/api/fipe?action=modelos&tipo=${tipo}&marca=${value}`
      );
      setModelos(json.data?.modelos || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar modelos.");
    } finally {
      setLoadingModelos(false);
    }
  };

  const handleModelo = async (value: string) => {
    setModeloSel(value);
    setAnos([]);
    setAnoSel("");
    setFipeResult(null);

    if (!value || !marcaSel) return;

    setLoadingAnos(true);
    try {
      const json = await fetchJson<{ success: boolean; data: FipeOption[] }>(
        `/api/fipe?action=anos&tipo=${tipo}&marca=${marcaSel}&modelo=${value}`
      );
      setAnos(json.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao carregar anos.");
    } finally {
      setLoadingAnos(false);
    }
  };

  const consultarFipe = async () => {
    if (!marcaSel || !modeloSel || !anoSel) {
      toast.error("Selecione marca, modelo e ano.");
      return;
    }

    setLoadingFipe(true);
    setFipeResult(null);

    try {
      const json = await fetchJson<{ success: boolean; data: FipePriceResult }>(
        `/api/fipe?action=preco&tipo=${tipo}&marca=${marcaSel}&modelo=${modeloSel}&ano=${anoSel}`
      );
      setFipeResult(json.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao consultar FIPE.");
    } finally {
      setLoadingFipe(false);
    }
  };

  const consultarPlaca = async () => {
    const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (normalizedPlate.length !== 7) {
      toast.error("Digite uma placa valida com 7 caracteres.");
      return;
    }

    setLoadingPlate(true);
    setPlateData(null);

    try {
      const json = await fetchJson<{ success: boolean; data: PlateData }>(
        `/api/fipe?action=plate&plate=${normalizedPlate}`
      );
      setPlate(normalizedPlate);
      setPlateData(json.data || null);
      toast.success("Consulta de placa concluida.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao consultar placa.");
    } finally {
      setLoadingPlate(false);
    }
  };

  const salvarNoVeiculo = async () => {
    if (!vehicleSel) {
      toast.error("Selecione um veiculo para salvar o valor FIPE.");
      return;
    }

    if (!fipeResult) {
      toast.error("Consulte o valor FIPE antes de salvar.");
      return;
    }

    const parsed = parseBrlValue(fipeResult.valor);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Valor FIPE invalido para salvar.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/fipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicleSel,
          fipePrice: parsed,
          fipeCode: fipeResult.codigoFipe,
        }),
      });

      const json = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao salvar FIPE no veiculo.");
      }

      toast.success("Valor FIPE salvo com sucesso.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar FIPE.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Consulta Rápida FIPE</h2>
          <p className="text-sm text-gray-500 mt-1">Consulte qualquer veiculo e compare valores na hora.</p>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            type="button"
            onClick={() => {
              setTab("manual");
              if (marcas.length === 0 && !loadingMarcas) {
                void carregarMarcas(tipo);
              }
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === "manual"
                ? "text-brand-primary border-b-2 border-brand-primary"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            FIPE Manual
          </button>
          <button
            type="button"
            onClick={() => setTab("placa")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              tab === "placa"
                ? "text-brand-primary border-b-2 border-brand-primary"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Consulta por Placa
          </button>
        </div>

        <div className="p-5 space-y-4">
          {tab === "manual" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["carros", "motos", "caminhoes"] as FipeTipo[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleTipo(item)}
                      className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                        tipo === item
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-white text-gray-600 border-gray-200 hover:border-brand-primary"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Marca</label>
                  {loadingMarcas ? (
                    <div className="text-sm text-gray-400 flex items-center gap-2 py-2">
                      <Loader2 size={15} className="animate-spin" /> Carregando marcas...
                    </div>
                  ) : (
                    <select
                      value={marcaSel}
                      onChange={(e) => void handleMarca(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                    >
                      <option value="">Selecione</option>
                      {marcas.map((marca) => (
                        <option key={marca.valor} value={marca.valor}>
                          {marca.nome}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Modelo</label>
                  {loadingModelos ? (
                    <div className="text-sm text-gray-400 flex items-center gap-2 py-2">
                      <Loader2 size={15} className="animate-spin" /> Carregando modelos...
                    </div>
                  ) : (
                    <select
                      value={modeloSel}
                      onChange={(e) => void handleModelo(e.target.value)}
                      disabled={!marcaSel}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:opacity-60"
                    >
                      <option value="">Selecione</option>
                      {modelos.map((modelo) => (
                        <option key={modelo.valor} value={modelo.valor}>
                          {modelo.nome}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ano</label>
                  {loadingAnos ? (
                    <div className="text-sm text-gray-400 flex items-center gap-2 py-2">
                      <Loader2 size={15} className="animate-spin" /> Carregando anos...
                    </div>
                  ) : (
                    <select
                      value={anoSel}
                      onChange={(e) => setAnoSel(e.target.value)}
                      disabled={!modeloSel}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 disabled:opacity-60"
                    >
                      <option value="">Selecione</option>
                      {anos.map((ano) => (
                        <option key={ano.valor} value={ano.valor}>
                          {ano.nome}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={consultarFipe}
                disabled={!anoSel || loadingFipe}
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60"
              >
                {loadingFipe ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                {loadingFipe ? "Consultando..." : "Consultar valor FIPE"}
              </button>
            </>
          )}

          {tab === "placa" && (
            <>
              <p className="text-sm text-gray-500">
                Digite uma placa para consulta automatica. Este recurso depende de um provedor de placa configurado.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  placeholder="ABC1D23"
                  maxLength={8}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-mono text-center uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                  onKeyDown={(e) => e.key === "Enter" && consultarPlaca()}
                />
                <button
                  type="button"
                  onClick={consultarPlaca}
                  disabled={loadingPlate}
                  className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-60"
                >
                  {loadingPlate ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  Consultar
                </button>
              </div>

              {plateData && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm">
                  <pre className="whitespace-pre-wrap break-all text-blue-900">{JSON.stringify(plateData, null, 2)}</pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {fipeResult && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Resultado FIPE</p>
            <p className="text-3xl font-bold text-blue-700">{fipeResult.valor}</p>
            <p className="text-sm text-gray-500 mt-1">{fipeResult.marca} • {fipeResult.modelo}</p>
            <p className="text-xs text-gray-400 mt-1">Codigo FIPE: {fipeResult.codigoFipe} • {fipeResult.mesReferencia}</p>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Salvar este valor em um veiculo do estoque</label>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
              <select
                value={vehicleSel}
                onChange={(e) => setVehicleSel(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              >
                <option value="">Selecione um veiculo</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={salvarNoVeiculo}
                disabled={saving || !vehicleSel}
                className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-secondary text-white font-semibold disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar no veículo"}
              </button>
            </div>

            {selectedVehicle && fipeValue && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50">
                  <p className="text-xs text-gray-400">Anuncio</p>
                  <p className="font-semibold text-brand-primary">{formatPrice(selectedVehicle.price)}</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50">
                  <p className="text-xs text-gray-400">FIPE</p>
                  <p className="font-semibold text-blue-700">{formatPrice(fipeValue)}</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-3 bg-gray-50">
                  <p className="text-xs text-gray-400">Diferenca</p>
                  {(() => {
                    const diff = selectedVehicle.price - fipeValue;
                    const up = diff > 0;
                    return (
                      <p className={`font-semibold inline-flex items-center gap-1 ${up ? "text-red-600" : "text-green-700"}`}>
                        {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {formatPrice(Math.abs(diff))}
                      </p>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
