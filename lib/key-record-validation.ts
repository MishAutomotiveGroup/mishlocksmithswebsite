import {
  pinMethodOptions,
  type KeyRecordPayload,
  type PinMethod,
  type PowerSupplyRequirement,
  type YesNoUnknown,
} from "@/lib/key-records";

const MAX_TEXT = 500;

function textValue(value: unknown, field: string, required = false) {
  if (typeof value !== "string") {
    if (required) throw new Error(`${field} is required.`);
    return "";
  }
  const cleaned = value.trim();
  if (required && !cleaned) throw new Error(`${field} is required.`);
  if (cleaned.length > MAX_TEXT) throw new Error(`${field} is too long.`);
  return cleaned;
}

function booleanValue(value: unknown, field: string): YesNoUnknown {
  if (value === true || value === false || value === null) return value;
  throw new Error(`${field} must be yes, no or not checked.`);
}

function pinMethodValue(value: unknown, field: string): PinMethod {
  if (value === null) return null;
  if (
    typeof value === "string" &&
    (pinMethodOptions as readonly string[]).includes(value)
  ) {
    return value as PinMethod;
  }
  throw new Error(`${field} is invalid.`);
}

function powerSupplyValue(value: unknown): PowerSupplyRequirement {
  if (value === null) return null;
  if (value === "required" || value === "not_required" || value === "optional") return value;
  throw new Error("Power supply requirement is invalid.");
}

function yearValue(value: unknown, field: string, required: boolean) {
  if (value === null && !required) return null;
  if (!Number.isInteger(value)) throw new Error(`${field} must be a whole year.`);
  const year = value as number;
  const maxYear = new Date().getFullYear() + 3;
  if (year < 1900 || year > maxYear) {
    throw new Error(`${field} must be between 1900 and ${maxYear}.`);
  }
  return year;
}

function priceValue(value: unknown, field: string) {
  if (value === null) return null;
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > 10_000_000) {
    throw new Error(`${field} is invalid.`);
  }
  return value as number;
}

export function parseKeyRecordPayload(input: unknown): KeyRecordPayload {
  if (!input || typeof input !== "object") throw new Error("Record details are missing.");
  const value = input as Record<string, unknown>;
  const yearFrom = yearValue(value.yearFrom, "Start year", true) as number;
  const yearTo = yearValue(value.yearTo, "End year", false);
  if (yearTo !== null && yearTo < yearFrom) {
    throw new Error("End year cannot be earlier than start year.");
  }

  const aklPinMethod = pinMethodValue(value.aklPinMethod, "AKL PIN method");
  const addKeyPinMethod = pinMethodValue(value.addKeyPinMethod, "Add-key PIN method");
  const aklPinSupplier = textValue(value.aklPinSupplier, "AKL PIN supplier");
  const addKeyPinSupplier = textValue(value.addKeyPinSupplier, "Add-key PIN supplier");
  return {
    make: textValue(value.make, "Make", true),
    model: textValue(value.model, "Model", true),
    yearFrom,
    yearTo,
    generation: textValue(value.generation, "Generation", true),
    transponderClonable: booleanValue(value.transponderClonable, "Transponder clonable"),
    powerSupplyRequirement: powerSupplyValue(value.powerSupplyRequirement),
    aklCompatible: booleanValue(value.aklCompatible, "AKL compatible"),
    addKeyCompatible: booleanValue(value.addKeyCompatible, "Add key compatible"),
    aklPinMethod,
    aklPinSupplier,
    addKeyPinMethod,
    addKeyPinSupplier,
    keyCloning: booleanValue(value.keyCloning, "Key cloning"),
    keyBlankCode: textValue(value.keyBlankCode, "Key blank code"),
    lishiInStock: booleanValue(value.lishiInStock, "Lishi in stock"),
    keyBlanksInStock: booleanValue(value.keyBlanksInStock, "Key blanks in stock"),
    universalKeyCompatible: booleanValue(value.universalKeyCompatible, "Universal key compatible"),
    compatibleUniversalKeys: textValue(value.compatibleUniversalKeys, "Compatible universal keys"),
    universalKeyInStock: booleanValue(value.universalKeyInStock, "Universal key in stock"),
    universalKeySupplier: textValue(value.universalKeySupplier, "Universal key supplier"),
    oemKeyInStock: booleanValue(value.oemKeyInStock, "OEM key in stock"),
    oemKeySupplier: textValue(value.oemKeySupplier, "OEM key supplier"),
    leadTime: textValue(value.leadTime, "Lead time"),
    oemPricePence: priceValue(value.oemPricePence, "OEM key price"),
    universalPricePence: priceValue(value.universalPricePence, "Universal key price"),
    notes: textValue(value.notes, "Notes"),
  };
}
