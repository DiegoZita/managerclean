import { useState, useMemo, useEffect, Fragment } from "react"; // configurator updated
import { X, Info, Tag, HelpCircle, Lock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ServiceItem } from "@/data/services";

interface ServiceConfiguratorProps {
  service: ServiceItem;
  onClose: () => void;
  isLoggedIn?: boolean;
  onAddToCart: (
    service: ServiceItem,
    quantity: number,
    details: string,
    price: number,
    infos?: string[]
  ) => void;
}

// ─── Frequency options ────────────────────────────────────────────────────────
const FREQUENCIES = ["Única vez", "Semestral", "Anual"] as const;
type Frequency = typeof FREQUENCIES[number];

// ─── Fallback values used when service data has no config ────────────────────
const FALLBACK_MATERIALS: { name: string; price: number; info?: string }[] = [
  { name: "Tecido", price: 0 },
  { name: "Couro", price: 80 },
];

const ServiceConfigurator = ({
  service,
  onClose,
  isLoggedIn = false,
  onAddToCart,
}: ServiceConfiguratorProps) => {
  const hasSeatPrices = (service.seat_prices?.length ?? 0) > 0;
  const hasM2Prices = (service.m2_prices?.length ?? 0) > 0;
  const hasModels = (service.models?.length ?? 0) > 0;
  const hasAdicionais = (service.adicionais?.length ?? 0) > 0;
  const hasTypes = (service.types?.length ?? 0) > 0;
  const hasAddons = (service.addons?.length ?? 0) > 0;
  const effectiveMaterials = service.materials?.length
    ? service.materials
    : FALLBACK_MATERIALS;

  const vis = service.visibility || {
    seats: true,
    m2: false,
    models: true,
    models_is_multiplier: false,
    adicionais: false,
    materials: true,
    types: true,
    addons: true,
    frequency: true,
  };

  const normalizedAdicionais = useMemo(() => {
    if (!hasAdicionais) return [];
    const ads = service.adicionais as any;
    if (ads && ads.length > 0 && ads[0].items) {
      return ads as { title: string; is_multiplier: boolean; items: { name: string; price: number; info?: string }[] }[];
    }
    // Migration for old data (flat array of items)
    return [{
      title: "Adicional",
      is_multiplier: !!(vis as any).adicionais_is_multiplier,
      items: ads
    }];
  }, [service.adicionais, hasAdicionais, vis]);

  // ─── Selections ─────────────────────────────────────────────────────────────
  const [seats, setSeats] = useState<number>(0);
  const [selectedM2Price, setSelectedM2Price] = useState<string>(
    service.m2_prices?.[0]?.name ?? "",
  );
  const [m2Width, setM2Width] = useState<number>(0);
  const [m2Length, setM2Length] = useState<number>(0);

  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedAdicionais, setSelectedAdicionais] = useState<Record<number, string>>({});
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedAddonNames, setSelectedAddonNames] = useState<Set<string>>(new Set());
  const [frequency, setFrequency] = useState<Frequency>("Única vez");
  const [m2Total, setM2Total] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);

  const isReady = useMemo(() => {
    if (vis.seats && hasSeatPrices && seats === 0) return false;
    if (vis.m2 && hasM2Prices) {
      if (vis.m2_total) {
        if (m2Total <= 0) return false;
      } else {
        if (m2Width * m2Length === 0) return false;
      }
    }
    if (vis.models && hasModels && !selectedModel) return false;
    if (vis.adicionais && hasAdicionais) {
      const allSelected = normalizedAdicionais.every((group, idx) => {
        if (group.items.length === 0) return true;
        return !!selectedAdicionais[idx];
      });
      if (!allSelected) return false;
    }
    if (vis.materials && effectiveMaterials.length > 0 && !selectedMaterial) return false;
    if (vis.types && hasTypes && !selectedType) return false;
    return true;
  }, [vis, hasSeatPrices, seats, hasM2Prices, m2Width, m2Length, hasModels, selectedModel, hasAdicionais, selectedAdicionais, effectiveMaterials.length, selectedMaterial, hasTypes, selectedType, normalizedAdicionais]);

  const isConfigCompleteForType = useMemo(() => {
    if (vis.seats && hasSeatPrices && seats === 0) return false;
    if (vis.m2 && hasM2Prices) {
      if (vis.m2_total) {
        if (m2Total <= 0) return false;
      } else {
        if (m2Width * m2Length === 0) return false;
      }
    }
    if (vis.models && hasModels && !selectedModel) return false;
    if (vis.adicionais && hasAdicionais) {
      const allSelected = normalizedAdicionais.every((group, idx) => {
        if (group.items.length === 0) return true;
        return !!selectedAdicionais[idx];
      });
      if (!allSelected) return false;
    }
    if (vis.materials && effectiveMaterials.length > 0 && !selectedMaterial) return false;
    return true;
  }, [vis, hasSeatPrices, seats, hasM2Prices, m2Width, m2Length, hasModels, selectedModel, hasAdicionais, selectedAdicionais, effectiveMaterials.length, selectedMaterial, normalizedAdicionais]);

  // ─── PRICING ENGINE ───────────────────────────────────────────────────────
  const pricing = useMemo(() => {
    // 1(a). Base price from seats
    const basePriceSeats = (vis.seats && hasSeatPrices)
      ? (service.seat_prices!.find((sp) => sp.seats === seats)?.price ?? 0)
      : 0;

    // 1(b). Base price from M2
    const totalAreaM2 = vis.m2_total ? m2Total : m2Width * m2Length;
    const basePriceM2 = (vis.m2 && hasM2Prices)
      ? (() => {
        const targetM2 = service.m2_prices!.find((m) => m.name === selectedM2Price);
        if (!targetM2) return 0;
        const unitPrice = targetM2.price;
        const minArea = vis.m2_min_area || 0;
        const minPrice = vis.m2_min_price || 0;

        if (minArea > 0 && totalAreaM2 > 0) {
          if (totalAreaM2 <= minArea) {
            return minPrice;
          } else {
            // Valor mínimo + o que exceder a área mínima cobrado por unidade
            return minPrice + (totalAreaM2 - minArea) * unitPrice;
          }
        }
        return unitPrice * totalAreaM2;
      })()
      : 0;

    // Use whichever base is active (usually only one is active at a time)
    const basePrice = Math.max(basePriceSeats, basePriceM2);

    // 2. Model additional (Multiplier or Additive)
    let modelMultiplier = 1;
    let modelAdd = 0;
    if (vis?.models && hasModels && selectedModel) {
      const ms = service.models!.find((m) => m.name === selectedModel);
      if (ms) {
        if (vis.models_is_multiplier) {
          modelMultiplier = ms.price;
        } else {
          modelAdd = ms.price;
        }
      }
    }

    // 2(b). Adicionais groups (Multiplier and Additive)
    let totalAdicionalMultiplier = 1;
    let totalAdicionalAdd = 0;
    if (vis?.adicionais && hasAdicionais) {
      normalizedAdicionais.forEach((group, idx) => {
        const selection = selectedAdicionais[idx];
        if (selection) {
          const item = group.items.find((i) => i.name === selection);
          if (item) {
            if (group.is_multiplier) {
              totalAdicionalMultiplier *= item.price;
            } else {
              totalAdicionalAdd += item.price;
            }
          }
        }
      });
    }

    // 3. Material additional (Fixed)
    const materialAdd = vis?.materials
      ? (effectiveMaterials.find((m) => m.name === selectedMaterial)?.price ?? 0)
      : 0;

    // 4. Service type additional (Multiplier)
    const typeMultiplier = (vis?.types && hasTypes && selectedType)
      ? (service.types!.find((t) => t.name === selectedType)?.price || 1)
      : 1;

    // 5. Addons total
    const addonsAdd = (vis?.addons && hasAddons)
      ? service.addons!
        .filter((a) => selectedAddonNames.has(a.name))
        .reduce((sum, a) => sum + a.price, 0)
      : 0;

    // 6. Subtotal (before discount)
    // Formula: (Base + MaterialFix + ModelFix + AdicionalFix) * ModelMult * AdicionalMult * TypeMult + Addons Fixos
    const subtotal = ((basePrice + materialAdd + modelAdd + totalAdicionalAdd) * modelMultiplier * totalAdicionalMultiplier * typeMultiplier) + addonsAdd;

    // 7. Frequency discount
    const discountPct =
      frequency === "Semestral"
        ? (service.freq_discounts?.semestral ?? 15)
        : frequency === "Anual"
          ? (service.freq_discounts?.anual ?? 20)
          : 0;

    const discountAmount = subtotal * (discountPct / 100);
    const totalFinal = subtotal - discountAmount;

    return {
      basePrice,
      basePriceSeats,
      basePriceM2,
      totalAreaM2,
      modelMultiplier,
      modelAdd,
      adicionalMultiplier: totalAdicionalMultiplier,
      adicionalAdd: totalAdicionalAdd,
      materialAdd,
      typeMultiplier,
      addonsAdd,
      subtotal,
      discountPct,
      discountAmount,
      totalFinal,
    };
  }, [
    seats, m2Width, m2Length, selectedM2Price,
    selectedModel, selectedMaterial, selectedType,
    selectedAddonNames, frequency,
    hasSeatPrices, hasM2Prices, hasModels, hasAdicionais, hasTypes, hasAddons,
    service, effectiveMaterials, vis, selectedAdicionais, normalizedAdicionais, m2Total
  ]);

  useEffect(() => {
    // Regra específica: se for Couro, remover variação com Impermeabilização
    if (selectedMaterial.toLowerCase() === "couro" && selectedType.toLowerCase().includes("impermeabiliza")) {
      setSelectedType("");
    }
  }, [selectedMaterial, selectedType]);

  const toggleAddon = (name: string) => {
    setSelectedAddonNames((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleAdd = () => {
    const requestedParts = [];
    if (vis.seats && hasSeatPrices) requestedParts.push(`${seats} lugares`);
    if (vis.m2 && hasM2Prices) requestedParts.push(`${pricing.totalAreaM2.toFixed(2)}m²`);
    if (vis.models && selectedModel) requestedParts.push(selectedModel);
    if (vis.materials) requestedParts.push(selectedMaterial);
    if (vis.types && selectedType) requestedParts.push(selectedType);
    
    const displayDetails = requestedParts.join(" - ");
    
    const otherParts = [];
    if (vis.adicionais && Object.keys(selectedAdicionais).length > 0) {
      const adsDetails = normalizedAdicionais
        .map((g, i) => selectedAdicionais[i])
        .filter(Boolean)
        .join(", ");
      if (adsDetails) otherParts.push(adsDetails);
    }
    if (vis.frequency && frequency !== "Única vez") otherParts.push(`(${frequency})`);
    if (vis.addons && selectedAddonNames.size > 0)
      otherParts.push(`+ ${[...selectedAddonNames].join(", ")}`);

    const details = otherParts.length > 0 ? `${displayDetails} [${otherParts.join(" | ")}]` : displayDetails;


    const infos: string[] = [];
    if (vis.models && selectedModel) {
      const ms = service.models?.find(m => m.name === selectedModel);
      if (ms?.info) infos.push(ms.info);
    }
    if (vis.adicionais) {
      normalizedAdicionais.forEach((g, i) => {
        const selName = selectedAdicionais[i];
        if (selName) {
          const item = g.items.find(it => it.name === selName);
          if (item?.info) infos.push(item.info);
        }
      });
    }
    if (vis.materials) {
      const mat = effectiveMaterials.find(m => m.name === selectedMaterial);
      if (mat?.info) infos.push(mat.info);
    }
    if (vis.types && selectedType) {
      const ty = service.types?.find(t => t.name === selectedType);
      if (ty?.info) infos.push(ty.info);
    }
    if (vis.addons) {
      service.addons?.forEach(a => {
        if (selectedAddonNames.has(a.name) && a.info) infos.push(a.info);
      });
    }

    onAddToCart(service, quantity, details, pricing.totalFinal, infos);
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col bg-background w-full">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-primary to-blue-500 p-4 text-primary-foreground shadow-md relative z-10">
        <div className="flex items-center gap-3">
          {service.icon && (service.icon.startsWith("http") || service.icon.startsWith("/")) && (
            <img src={service.icon} alt={service.name} className="h-12 w-12 shrink-0 object-contain drop-shadow-md" />
          )}
          <span className="font-bold text-lg">{service.name}</span>
        </div>
        <button onClick={onClose} className="hover:opacity-80 transition-opacity">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">

        {/* ── Número de lugares ──────────────────────────────────── */}
        {vis.seats && hasSeatPrices && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">
                Quantidade de lugares
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {service.seat_prices!
                .sort((a, b) => a.seats - b.seats)
                .map(({ seats: s }) => (
                  <button
                    key={s}
                    onClick={() => setSeats(s)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-colors ${seats === s
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border text-foreground hover:border-primary"
                      }`}
                  >
                    {s}
                  </button>
                ))}
            </div>
            <div className="flex items-center gap-4 mt-4 bg-muted/20 p-4 rounded-lg border">
              <img src="/lugares-icon.png" alt="Medida assento" className="w-16 h-16 flex-shrink-0 object-contain" />
              <div className="flex flex-col gap-1 text-sm text-foreground/90 font-medium leading-relaxed">
                <p>"O número de lugares de um sofá é calculado</p>
                <p>considerando, em média, 60 cm por assento, o que equivale ao espaço de um adulto sentado confortavelmente."</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Área M2 ────────────────────────────────────────────── */}
        {vis.m2 && hasM2Prices && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-foreground">
                Qual o tamanho? (m²)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {!vis.m2_total ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Largura (m)</label>
                    <input
                      type="number"
                      min="0" step="0.1"
                      value={m2Width || ""}
                      onChange={e => setM2Width(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Comprimento (m)</label>
                    <input
                      type="number"
                      min="0" step="0.1"
                      value={m2Length || ""}
                      onChange={e => setM2Length(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                </>
              ) : (
                <div className="col-span-2 space-y-1">
                  <label className="text-xs text-muted-foreground">Metragem Total (m²)</label>
                  <input
                    type="number"
                    min="0" step="0.1"
                    value={m2Total || ""}
                    onChange={e => setM2Total(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="Ex: 45"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 items-end">
              <div className="text-right text-xs text-muted-foreground">
                Área total: <span className="font-bold text-foreground">{pricing.totalAreaM2.toFixed(2)} m²</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Modelo ────────────────────────────────────────────── */}
        {vis.models && hasModels && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Modelo</h3>
            <div className="flex flex-wrap gap-2">
              {service.models!.map((model) => {
                const isSelected = selectedModel === model.name;
                return (
                  <button
                    key={model.name}
                    onClick={() => setSelectedModel(model.name)}
                    className={`px-4 py-2 rounded-[18px] border text-sm transition-all flex items-center gap-1.5 ${isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border text-foreground hover:border-primary"
                      }`}
                  >
                    <span className="font-bold">{model.name}</span>
                  </button>
                );
              })}
            </div>
            {selectedModel && service.models?.find(m => m.name === selectedModel)?.info && (
              <div className="bg-muted/30 p-3 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-1 duration-300">
                <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                  {service.models.find(m => m.name === selectedModel)?.info}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Adicionais Customizados ─────────────────────────── */}
        {vis.adicionais && hasAdicionais && (
          <div className="space-y-6">
            {normalizedAdicionais.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-3">
                <h3 className="font-semibold text-sm text-foreground">
                  {group.title || "Adicional"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => {
                    const isSelected = selectedAdicionais[groupIdx] === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => setSelectedAdicionais(prev => ({ ...prev, [groupIdx]: item.name }))}
                        className={`px-4 py-2 rounded-[18px] border text-sm transition-all flex items-center gap-1.5 ${isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "border-border text-foreground hover:border-primary"
                          }`}
                      >
                        <span className="font-bold">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
                {selectedAdicionais[groupIdx] && group.items.find(it => it.name === selectedAdicionais[groupIdx])?.info && (
                  <div className="bg-muted/30 p-3 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-1 duration-300">
                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                      {group.items.find(it => it.name === selectedAdicionais[groupIdx])?.info}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Material ──────────────────────────────────────────── */}
        {vis.materials && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Material</h3>
            <div className="flex flex-wrap gap-2">
              {effectiveMaterials.map((mat) => {
                const isSelected = selectedMaterial === mat.name;
                return (
                  <button
                    key={mat.name}
                    onClick={() => setSelectedMaterial(mat.name)}
                    className={`px-4 py-2 rounded-[18px] border text-sm transition-all flex items-center gap-1.5 ${isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "border-border text-foreground hover:border-primary"
                      }`}
                  >
                    <span className="font-bold">{mat.name}</span>
                  </button>
                );
              })}
            </div>
            {selectedMaterial && effectiveMaterials.find(m => m.name === selectedMaterial)?.info && (
              <div className="bg-muted/30 p-3 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-1 duration-300">
                <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                  {effectiveMaterials.find(m => m.name === selectedMaterial)?.info}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Tipo de Serviço ───────────────────────────────────── */}
        {vis.types && hasTypes && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Tipo de Serviço</h3>
            <div className="space-y-2">
              {service.types!
                .filter((type) => {
                  if (selectedMaterial.toLowerCase() === "couro" && type.name.toLowerCase().includes("impermeabiliza")) {
                    return false;
                  }
                  return true;
                })
                .map((type) => {
                  const isSelected = selectedType === type.name;
                  const typeMult = type.price || 1;
                  // Projeta o preço já multiplicando pelo tipo e modelo
                  const currentBaseWithModel = (pricing.basePrice + pricing.materialAdd + pricing.modelAdd + pricing.adicionalAdd) * pricing.modelMultiplier * pricing.adicionalMultiplier;
                  const aditionalPrice = (currentBaseWithModel * typeMult) - currentBaseWithModel;
                  const projectedPrice = (currentBaseWithModel * typeMult) + pricing.addonsAdd;

                  return (
                    <div
                      key={type.name}
                      onClick={() => setSelectedType(type.name)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-primary" : "border-border"
                          }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <span className="text-sm font-medium">{type.name}</span>
                      </div>
                      <div className="text-right">
                        {isLoggedIn ? (
                          isConfigCompleteForType ? (
                            <div className={`text-sm font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                                {projectedPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground italic">
                              Selecione as opções acima
                            </div>
                          )
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Lock className="w-3 h-3" /> Login
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
            {selectedType && service.types?.find(t => t.name === selectedType)?.info && (
              <div className="bg-muted/30 p-3 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-1 duration-300">
                <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                  {service.types.find(t => t.name === selectedType)?.info}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Frequência ────────────────────────────────────────── */}
        {vis.frequency && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Frequência do serviço</h3>
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20 space-y-4">
              <h4 className="text-primary font-semibold text-sm">
                Até {service.freq_discounts?.anual ?? 20}% OFF nos serviços recorrentes
              </h4>
              <p className="text-xs text-muted-foreground">
                Com a recorrência você se programa e ganha descontos automáticos.
              </p>
              <div className="flex gap-2">
                {FREQUENCIES.map((freq) => {
                  const pct =
                    freq === "Semestral"
                      ? service.freq_discounts?.semestral ?? 15
                      : freq === "Anual"
                        ? service.freq_discounts?.anual ?? 20
                        : 0;
                  return (
                    <button
                      key={freq}
                      onClick={() => setFrequency(freq)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors flex-1 ${frequency === freq
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-primary text-primary hover:bg-primary/10"
                        }`}
                    >
                      {freq}
                      {pct > 0 && <span className="ml-1 opacity-80">(-{pct}%)</span>}
                    </button>
                  );
                })}
              </div>
              {frequency !== "Única vez" && (
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4 pt-1">
                  <li>Desconto de {pricing.discountPct}% aplicado automaticamente</li>
                  <li>Renovação{frequency === "Semestral" ? " a cada 6 meses" : " anual"}</li>
                  <li>Recomendado para quem possui crianças, pets ou alergias</li>
                  <li>Cancelamento gratuito até 24h do agendamento</li>
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── Serviços Adicionais ───────────────────────────────── */}
        {vis.addons && hasAddons && (
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-sm text-foreground">Serviços adicionais</h3>
            <div className="space-y-2">
              {service.addons!.map((addon) => {
                const isOn = selectedAddonNames.has(addon.name);
                return (
                  <Fragment key={addon.name}>
                    <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleAddon(addon.name)}
                        className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${isOn ? "bg-primary" : "bg-muted"
                          }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isOn ? "left-5" : "left-1"
                            }`}
                        />
                      </button>
                      <div className="flex flex-col">
                        <span className="text-sm">{addon.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLoggedIn ? (
                        <span className={`text-sm font-medium ${isOn ? "text-primary" : ""}`}>
                          +{addon.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Login
                        </span>
                      )}
                    </div>
                  </div>
                  {isOn && addon.info && (
                    <div className="ml-12 mt-1 mb-2 bg-muted/30 p-3 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-1 duration-300">
                      <p className="text-[11px] text-muted-foreground italic leading-tight">
                        {addon.info}
                      </p>
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      )}
      </div>

      {/* ── Footer: Breakdown + Total + Add ─────────────────────── */}
      <div className="border-t bg-card p-4 space-y-3">
        {/* Breakdown */}
        {isReady && (
          <div className="rounded-xl bg-muted/40 p-3 space-y-1.5 text-xs">
            {vis.seats && seats > 0 && (
              <div className="text-muted-foreground">
                <span>{service.name}{vis.models && selectedModel ? ` - ${selectedModel}` : ""}{vis.adicionais && Object.keys(selectedAdicionais).length > 0 ? ` - ${Object.values(selectedAdicionais).join(', ')}` : ""} de {seats} lugares</span>
              </div>
            )}
            {vis.m2 && pricing.totalAreaM2 > 0 && (
              <div className="text-muted-foreground">
                <span>{service.name}{vis.models && selectedModel ? ` - ${selectedModel}` : ""}{vis.adicionais && Object.keys(selectedAdicionais).length > 0 ? ` - ${Object.values(selectedAdicionais).join(', ')}` : ""} ({pricing.totalAreaM2.toFixed(2)} m²)</span>
              </div>
            )}
            {vis.types && selectedType && (
              <div className="text-muted-foreground">
                <span>{vis.materials && selectedMaterial ? `${selectedMaterial} - ` : ""}{selectedType}</span>
              </div>
            )}
            {vis.addons && [...selectedAddonNames].length > 0 && (
              <div className="text-muted-foreground">
                <span>Adicional: {[...selectedAddonNames].join(', ')}</span>
              </div>
            )}
            {pricing.subtotal > 0 && (
              <div className="flex justify-between font-medium text-foreground border-t border-border pt-1.5 mt-1">
                <span>Subtotal</span>
                <span>{pricing.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            )}
            {pricing.discountPct > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Desconto {frequency} ({pricing.discountPct}%)
                </span>
                <span>- {pricing.discountAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            )}
          </div>
        )}

        {/* Total */}
        {isLoggedIn ? (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground">Total do item:</span>
              {isReady ? (
                <span className="text-2xl font-bold text-primary">
                  {(pricing.totalFinal * quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              ) : (
                <span className="text-2xl font-bold text-muted-foreground/50">
                  R$ 0,00
                </span>
              )}
            </div>

            {/* Qty + Add button */}
            <div className="flex gap-3">
              <div className="flex items-center rounded-lg border bg-background">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-primary hover:bg-muted font-bold text-lg leading-none"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-primary hover:bg-muted font-bold text-lg leading-none"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAdd}
                disabled={!isReady}
                className="flex-1 rounded-lg bg-primary py-3 text-center text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Adicionar ao carrinho
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Lock className="w-6 h-6 text-slate-400" />
            <p className="text-sm font-semibold text-slate-600 text-center">Faça login para ver o preço e adicionar ao carrinho</p>
            <a
              href="/login"
              className="px-6 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Fazer Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceConfigurator;
