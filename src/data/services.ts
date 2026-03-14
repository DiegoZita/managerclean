export interface ServiceItem {
  id: string;
  name: string;
  icon: string;
  category: "casa" | "empresa" | "outros" | "orcamento_pdf";
  order_index?: number;
  price?: number;

  /**
   * PRICING ENGINE
   * Base price per number of seats. This is the foundation of all calculations.
   * All other price fields are ADDITIVE on top of the base.
   */
  seat_prices?: { seats: number; price: number }[];

  /** Additive: each model adds its price on top of the seat base */
  models?: { name: string; price: number; info?: string }[];

  /** Additive: each material adds its price on top */
  materials?: { name: string; price: number; info?: string }[];

  /** Additive: each service type adds its price on top */
  types?: { name: string; price: number; info?: string }[];

  /** Additive/Multiplier: Multiple groups of adicionales */
  adicionais?: {
    title: string;
    is_multiplier: boolean;
    items: { name: string; price: number; info?: string }[];
  }[];

  /** Additive: each selected addon adds its price */
  addons?: { name: string; price: number; info?: string }[];

  /** Frequency discounts as percentages applied to the subtotal */
  freq_discounts?: { semestral: number; anual: number };

  /** M2 Pricing (Alternative to seat base) */
  m2_prices?: { name: string; price: number; info?: string }[];

  /** Visibility settings for configurator sections */
  visibility?: {
    seats: boolean;
    m2: boolean;
    m2_total?: boolean;
    models: boolean;
    models_is_multiplier?: boolean;
    adicionais: boolean;
    adicionais_is_multiplier?: boolean;
    materials: boolean;
    types: boolean;
    addons: boolean;
    frequency: boolean;
    not_included?: boolean;
    not_included_title?: string;
    not_included_items?: { name: string }[];
    m2_min_area?: number;
    m2_min_price?: number;
    show_in_both?: boolean;
    order_index_casa?: number;
    order_index_empresa?: number;
  };
}

/** Static fallback services (only used if DB is not connected) */
export const serviceItems: ServiceItem[] = [];

export interface CartItem {
  service: ServiceItem;
  quantity: number;
  details: string;
  price: number;
  infos?: string[];
}
