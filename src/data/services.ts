export interface ServiceItem {
  id: string;
  name: string;
  icon: string;
  category: "casa" | "empresa" | "outros" | "orcamento_pdf";
  order_index?: number;

  /**
   * PRICING ENGINE
   * Base price per number of seats. This is the foundation of all calculations.
   * All other price fields are ADDITIVE on top of the base.
   */
  seat_prices?: { seats: number; price: number }[];

  /** Additive: each model adds its price on top of the seat base */
  models?: { name: string; price: number }[];

  /** Additive: each material adds its price on top */
  materials?: { name: string; price: number }[];

  /** Additive: each service type adds its price on top */
  types?: { name: string; price: number }[];

  /** Additive/Multiplier: Multiple groups of adicionales */
  adicionais?: {
    title: string;
    is_multiplier: boolean;
    items: { name: string; price: number }[];
  }[];

  /** Additive: each selected addon adds its price */
  addons?: { name: string; price: number }[];

  /** Frequency discounts as percentages applied to the subtotal */
  freq_discounts?: { semestral: number; anual: number };

  /** M2 Pricing (Alternative to seat base) */
  m2_prices?: { name: string; price: number }[];

  /** Visibility settings for configurator sections */
  visibility?: {
    seats: boolean;
    m2: boolean;
    models: boolean;
    models_is_multiplier?: boolean;
    adicionais: boolean;
    materials: boolean;
    types: boolean;
    addons: boolean;
    frequency: boolean;
  };
}

/** Static fallback services (only used if DB is not connected) */
export const serviceItems: ServiceItem[] = [];

export interface CartItem {
  service: ServiceItem;
  quantity: number;
  details: string;
  price: number;
}
