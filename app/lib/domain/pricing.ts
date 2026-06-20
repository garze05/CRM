// Motor de cálculo de precio paquete-based.
//
// Regla de negocio: un paquete tiene UN precio base (Package.basePrice). El precio
// efectivo para un cliente = precio base + recargo según su tipo (los porcentajes
// viven en Settings.surcharge*Percent, editables en /ajustes), redondeado al
// múltiplo configurado en Settings.priceRoundingTo (default ₡1.000).
//
// Módulo puro (sin dependencias de BD ni de servidor): testeable y reutilizable
// tanto en server actions como en componentes de cliente.

/** Tipos comerciales de cliente (coinciden con el enum ClientType de Prisma). */
export type ClientType =
  | "FAMILY"
  | "EDUCATIONAL"
  | "CORPORATE"
  | "SHOPPING_CENTER"
  | "ADVERTISING_AGENCY";

/** Porcentajes de recargo por tipo de cliente (FAMILY = 0 implícito). */
export type SurchargeSettings = {
  surchargeEducationalPercent: number;
  surchargeCorporatePercent: number;
  surchargeShoppingCenterPercent: number;
  surchargeAgencyPercent: number;
};

/** Configuración necesaria para calcular el precio efectivo de un paquete. */
export type PricingSettings = SurchargeSettings & {
  /** Múltiplo de redondeo del precio efectivo (ej. 1000). */
  priceRoundingTo: number;
};

/** Devuelve el % de recargo aplicable a un tipo de cliente. FAMILY no tiene recargo. */
export function surchargePercentForClientType(
  type: ClientType,
  settings: SurchargeSettings,
): number {
  switch (type) {
    case "EDUCATIONAL":
      return settings.surchargeEducationalPercent;
    case "CORPORATE":
      return settings.surchargeCorporatePercent;
    case "SHOPPING_CENTER":
      return settings.surchargeShoppingCenterPercent;
    case "ADVERTISING_AGENCY":
      return settings.surchargeAgencyPercent;
    case "FAMILY":
    default:
      return 0;
  }
}

/**
 * Redondea `amount` al múltiplo positivo más cercano (medios hacia arriba).
 * Si `multiple` no es válido (≤ 0), redondea al entero más cercano.
 */
export function roundToMultiple(amount: number, multiple: number): number {
  if (!Number.isFinite(multiple) || multiple <= 0) return Math.round(amount);
  // Limpiar el arrastre de punto flotante a céntimos antes de redondear al
  // múltiplo: sin esto, un valor que debería ser exacto (ej. 100.500) puede
  // quedar como 100499.9999… y caer al lado equivocado del redondeo.
  const cents = Math.round(amount * 100) / 100;
  return Math.round(cents / multiple) * multiple;
}

/**
 * Precio efectivo de un paquete para un tipo de cliente:
 * redondear( basePrice × (1 + recargo%) ) al múltiplo de priceRoundingTo.
 */
export function effectivePackagePrice(
  basePrice: number,
  clientType: ClientType,
  settings: PricingSettings,
): number {
  const surcharge = surchargePercentForClientType(clientType, settings);
  const withSurcharge = basePrice * (1 + surcharge / 100);
  return roundToMultiple(withSurcharge, settings.priceRoundingTo);
}

/** Tipos de cliente en orden de presentación (para tablas de precios). */
export const CLIENT_TYPES_ORDER: readonly ClientType[] = [
  "FAMILY",
  "EDUCATIONAL",
  "CORPORATE",
  "SHOPPING_CENTER",
  "ADVERTISING_AGENCY",
];

/** Etiquetas en español de los tipos de cliente. */
export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  FAMILY: "Familiar",
  EDUCATIONAL: "Educativo",
  CORPORATE: "Corporativo",
  SHOPPING_CENTER: "Centro Comercial",
  ADVERTISING_AGENCY: "Agencia de Publicidad",
};

/** Desglose del precio efectivo de un paquete por cada tipo de cliente. */
export function packagePriceBreakdown(
  basePrice: number,
  settings: PricingSettings,
): { clientType: ClientType; label: string; price: number }[] {
  return CLIENT_TYPES_ORDER.map(clientType => ({
    clientType,
    label: CLIENT_TYPE_LABELS[clientType],
    price: effectivePackagePrice(basePrice, clientType, settings),
  }));
}

// ---------------------------------------------------------------------------
// Precio base sugerido de un paquete (suma de sus componentes)
//
// Porta la lógica de descuentos del motor de cotización (Quotation API,
// cotizador_okidoki.py): por cada ítem el subtotal es
//   precio × (1 − descuento) × horas × cantidad
// donde el descuento aplicable = max(
//   descuento por cantidad (solo del 2.º+ ítem de un mismo grupo/categoría),
//   descuento por horas (si la duración alcanza el mínimo),
// ) topado en maxDiscountPercent.
//
// El precio base del paquete es el precio FAMILIAR (sin recargo por tipo de
// cliente); el recargo se aplica después con packagePriceBreakdown. Por eso
// aquí NO se aplica recargo.
// ---------------------------------------------------------------------------

/** Reglas de descuento por cantidad/horas (coinciden con Settings). */
export type DiscountSettings = {
  quantityDiscountPercent: number;
  hoursDiscountPercent: number;
  hoursDiscountMinHours: number;
  maxDiscountPercent: number;
};

/** Un componente del paquete para calcular su aporte al precio base. */
export type PackageComponentInput = {
  /** Clave de agrupación para el descuento por cantidad (ej. la categoría). */
  groupKey: string;
  /** Precio unitario del catálogo (por hora si `perHour`, fijo si no). */
  unitPrice: number;
  /** Si el precio se multiplica por la duración del paquete. */
  perHour: boolean;
  quantity: number;
};

export type PackageComponentCost = PackageComponentInput & {
  /** Descuento aplicado a la línea (fracción 0–1). */
  discount: number;
  /** Aporte de la línea al precio base (ya con descuento, sin recargo). */
  subtotal: number;
};

/**
 * Calcula el aporte de cada componente al precio base, aplicando descuentos por
 * cantidad y horas como el motor de cotización. El primer ítem de cada grupo no
 * recibe descuento por cantidad; el 2.º en adelante sí.
 */
export function packageComponentCosts(
  components: PackageComponentInput[],
  durationHours: number,
  settings: DiscountSettings,
): PackageComponentCost[] {
  const qtyDiscount = settings.quantityDiscountPercent / 100;
  const hoursDiscount =
    durationHours >= settings.hoursDiscountMinHours
      ? settings.hoursDiscountPercent / 100
      : 0;
  const cap = settings.maxDiscountPercent / 100;
  const seenGroups = new Set<string>();

  return components.map(component => {
    const isFirstInGroup = !seenGroups.has(component.groupKey);
    seenGroups.add(component.groupKey);
    const quantityPart = isFirstInGroup ? 0 : qtyDiscount;
    const discount = Math.min(cap, Math.max(quantityPart, hoursDiscount));
    const hoursFactor = component.perHour ? Math.max(durationHours, 0) : 1;
    const subtotal =
      component.unitPrice * (1 - discount) * hoursFactor * component.quantity;
    return { ...component, discount, subtotal };
  });
}

/**
 * Precio base sugerido = suma de los aportes de cada componente, redondeada al
 * múltiplo configurado. Es solo una sugerencia: el usuario puede ajustarla.
 */
export function suggestedPackageBasePrice(
  components: PackageComponentInput[],
  durationHours: number,
  settings: DiscountSettings & { priceRoundingTo: number },
): number {
  const total = packageComponentCosts(components, durationHours, settings).reduce(
    (sum, component) => sum + component.subtotal,
    0,
  );
  return roundToMultiple(total, settings.priceRoundingTo);
}
