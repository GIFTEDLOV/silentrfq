// Builds and parses the single on-chain `description` string used by SilentRFQ.
//
// The contract only stores one plain-text string (see SilentRFQFactory.createRFQ /
// SilentRFQ.description). To support a structured procurement brief without any
// contract or ABI change, the "title" and the structured fields are combined into
// one string: the first line is the title, followed by a blank line, followed by
// labeled sections. parseRFQDescription() reverses this for display, and falls
// back safely to treating the whole string as a plain title when it doesn't match
// the structured shape (e.g. every RFQ created before this feature existed).

export const CATEGORY_OPTIONS = [
  "Electronics",
  "Office supplies",
  "Construction",
  "Logistics",
  "Manufacturing",
  "Medical supplies",
  "Energy",
  "Food & beverage",
  "Professional services",
  "Other",
] as const;

export const UNIT_OPTIONS = [
  "pieces",
  "units",
  "boxes",
  "kg",
  "tons",
  "liters",
  "meters",
  "hours",
  "days",
  "lots",
  "other",
] as const;

export const CURRENCY_OPTIONS = ["NGN", "USD", "EUR", "GBP", "USDC", "Other"] as const;

export type StructuredRFQFields = {
  goods: string;
  category: string;
  quantity: string;
  unit: string;
  customUnit: string;
  currency: string;
  customCurrency: string;
  deliveryLocation: string;
  deliveryTarget: string;
  requirements: string;
  additionalTerms: string;
};

export function resolveUnitLabel(unit: string, customUnit: string): string {
  return unit === "other" ? customUnit.trim() || "units" : unit;
}

export function resolveCurrencyLabel(currency: string, customCurrency: string): string {
  return currency === "Other" ? customCurrency.trim() || "Other" : currency;
}

export function buildRFQTitle(
  fields: Pick<StructuredRFQFields, "goods" | "quantity" | "unit" | "customUnit" | "deliveryLocation">
): string {
  const unitLabel = resolveUnitLabel(fields.unit, fields.customUnit);
  const qty = fields.quantity.trim() || "0";
  const goods = fields.goods.trim() || "goods";
  const base = `Supply ${qty} ${unitLabel} of ${goods}`;
  const location = fields.deliveryLocation.trim();
  return location ? `${base} to ${location}` : base;
}

export function buildRFQDescription(title: string, fields: StructuredRFQFields): string {
  const unitLabel = resolveUnitLabel(fields.unit, fields.customUnit);
  const currencyLabel = resolveCurrencyLabel(fields.currency, fields.customCurrency);

  const infoLines = [
    `RFQ Type: Fixed quantity price quote`,
    `Category: ${fields.category}`,
    `Goods / Service: ${fields.goods.trim()}`,
    `Quantity: ${fields.quantity.trim()} ${unitLabel}`,
    `Currency: ${currencyLabel}`,
  ];
  if (fields.deliveryLocation.trim()) infoLines.push(`Delivery Location: ${fields.deliveryLocation.trim()}`);
  if (fields.deliveryTarget.trim()) infoLines.push(`Delivery Target: ${fields.deliveryTarget.trim()}`);

  const sections = [title.trim(), infoLines.join("\n")];

  if (fields.requirements.trim()) {
    sections.push(`Requirements:\n${fields.requirements.trim()}`);
  }
  if (fields.additionalTerms.trim()) {
    sections.push(`Additional Terms:\n${fields.additionalTerms.trim()}`);
  }
  sections.push(
    `Vendor Instruction:\nSubmit your encrypted total price quote in ${currencyLabel} for fulfilling the full RFQ. The buyer has already defined the quantity, specifications, currency, and terms. Your bid amount should represent the total price for the full requirement.`
  );
  sections.push(
    `Privacy:\nBid amounts are encrypted before being sent on-chain. Only the winning vendor is revealed after finalization and gateway reveal.`
  );

  return sections.join("\n\n");
}

const SINGLE_LINE_LABELS = [
  "RFQ Type",
  "Category",
  "Goods / Service",
  "Quantity",
  "Currency",
  "Delivery Location",
  "Delivery Target",
] as const;

type SingleLineLabel = (typeof SINGLE_LINE_LABELS)[number];

const MULTILINE_LABELS = ["Requirements", "Additional Terms", "Vendor Instruction", "Privacy"] as const;

export type ParsedRFQ = {
  title: string;
  isStructured: boolean;
  fields: Partial<Record<SingleLineLabel, string>>;
  requirements?: string;
  additionalTerms?: string;
  vendorInstruction?: string;
  privacy?: string;
};

/**
 * Parses a SilentRFQ `description` string. Returns isStructured:false and the
 * raw string as the title whenever the shape doesn't match — this is the safe
 * fallback path for every RFQ created before the structured builder existed.
 */
export function parseRFQDescription(raw: string | undefined): ParsedRFQ {
  const description = raw ?? "";
  const parts = description.split(/\n\n+/);

  if (parts.length < 2) {
    return { title: description, isStructured: false, fields: {} };
  }

  const fields: ParsedRFQ["fields"] = {};
  let requirements: string | undefined;
  let additionalTerms: string | undefined;
  let vendorInstruction: string | undefined;
  let privacy: string | undefined;

  for (const section of parts.slice(1)) {
    const lines = section.split("\n");
    const headerMatch = lines[0].trim().match(/^([A-Za-z /]+):$/);

    if (headerMatch && (MULTILINE_LABELS as readonly string[]).includes(headerMatch[1])) {
      const body = lines.slice(1).join("\n").trim();
      if (headerMatch[1] === "Requirements") requirements = body;
      else if (headerMatch[1] === "Additional Terms") additionalTerms = body;
      else if (headerMatch[1] === "Vendor Instruction") vendorInstruction = body;
      else if (headerMatch[1] === "Privacy") privacy = body;
      continue;
    }

    for (const line of lines) {
      const m = line.match(/^([A-Za-z /]+):\s*(.*)$/);
      if (m && (SINGLE_LINE_LABELS as readonly string[]).includes(m[1])) {
        fields[m[1] as SingleLineLabel] = m[2].trim();
      }
    }
  }

  const isStructured = !!fields["RFQ Type"];

  if (!isStructured) {
    return { title: description, isStructured: false, fields: {} };
  }

  return {
    title: parts[0].trim(),
    isStructured: true,
    fields,
    requirements,
    additionalTerms,
    vendorInstruction,
    privacy,
  };
}

/** Lightweight helper for list/card contexts that only need a short title. */
export function getRFQDisplayTitle(raw: string | undefined): string {
  return parseRFQDescription(raw).title;
}
