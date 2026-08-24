export type YesNoUnknown = boolean | null;

export type PowerSupplyRequirement =
  | "required"
  | "not_required"
  | "optional"
  | null;

export const pinMethodOptions = [
  "readable_by_autel",
  "purchase_online",
  "not_required",
  "unobtainable",
] as const;

export type PinMethod = (typeof pinMethodOptions)[number] | null;

export type KeyRecordPayload = {
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number | null;
  generation: string;
  transponderClonable: YesNoUnknown;
  powerSupplyRequirement: PowerSupplyRequirement;
  aklCompatible: YesNoUnknown;
  addKeyCompatible: YesNoUnknown;
  aklPinMethod: PinMethod;
  aklPinSupplier: string;
  addKeyPinMethod: PinMethod;
  addKeyPinSupplier: string;
  keyCloning: YesNoUnknown;
  keyBlankCode: string;
  lishiInStock: YesNoUnknown;
  keyBlanksInStock: YesNoUnknown;
  universalKeyCompatible: YesNoUnknown;
  compatibleUniversalKeys: string;
  universalKeyInStock: YesNoUnknown;
  universalKeySupplier: string;
  oemKeyInStock: YesNoUnknown;
  oemKeySupplier: string;
  leadTime: string;
  oemPricePence: number | null;
  universalPricePence: number | null;
  notes: string;
};

export type KeyRecordView = KeyRecordPayload & {
  id: string;
  carPhotoUrl: string | null;
  oemKeyPhotoUrl: string | null;
  universalKeyPhotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export const emptyKeyRecord: KeyRecordPayload = {
  make: "",
  model: "",
  yearFrom: new Date().getFullYear(),
  yearTo: null,
  generation: "",
  transponderClonable: null,
  powerSupplyRequirement: null,
  aklCompatible: null,
  addKeyCompatible: null,
  aklPinMethod: null,
  aklPinSupplier: "",
  addKeyPinMethod: null,
  addKeyPinSupplier: "",
  keyCloning: null,
  keyBlankCode: "",
  lishiInStock: null,
  keyBlanksInStock: null,
  universalKeyCompatible: null,
  compatibleUniversalKeys: "",
  universalKeyInStock: null,
  universalKeySupplier: "",
  oemKeyInStock: null,
  oemKeySupplier: "",
  leadTime: "",
  oemPricePence: null,
  universalPricePence: null,
  notes: "",
};

export function formatVehicleYears(yearFrom: number, yearTo: number | null) {
  if (!yearTo || yearTo === yearFrom) return String(yearFrom);
  return `${yearFrom}–${yearTo}`;
}

export function formatPrice(pricePence: number | null) {
  if (pricePence === null) return "Not set";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pricePence / 100);
}

export function yesNoLabel(value: YesNoUnknown) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "Not checked";
}
