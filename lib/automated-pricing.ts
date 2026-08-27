export type AutomatedPricingService = "spare_key" | "all_keys_lost";
export type AutomatedKeyType = "aftermarket" | "universal";

type PriceableVehicle = {
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number | null;
  generation: string;
};

export type AutomatedPrice = {
  keyType: AutomatedKeyType;
  displayName: string;
  serviceChargePence: number;
  estimatedPartsCostPence: number;
  totalPricePence: number;
};

type PriceBand = {
  maximumStartYear: number;
  serviceChargePence: number;
  aftermarketPartsPence: number;
  universalPartsPence: number;
};

/**
 * Initial pricing controls. The two customer prices in each band use exactly
 * the same service charge and differ only by the estimated cost of the part.
 * Values are deliberately centralised so they can be calibrated without
 * changing the quote flow.
 */
const PRICE_BANDS: PriceBand[] = [
  { maximumStartYear: 1995, serviceChargePence: 10_500, aftermarketPartsPence: 3_500, universalPartsPence: 2_000 },
  { maximumStartYear: 2004, serviceChargePence: 11_500, aftermarketPartsPence: 4_000, universalPartsPence: 2_500 },
  { maximumStartYear: 2011, serviceChargePence: 13_000, aftermarketPartsPence: 4_500, universalPartsPence: 3_000 },
  { maximumStartYear: 2016, serviceChargePence: 14_000, aftermarketPartsPence: 5_500, universalPartsPence: 3_500 },
  { maximumStartYear: 2019, serviceChargePence: 15_500, aftermarketPartsPence: 6_500, universalPartsPence: 4_000 },
  { maximumStartYear: Number.POSITIVE_INFINITY, serviceChargePence: 17_500, aftermarketPartsPence: 8_000, universalPartsPence: 5_000 },
];

// Shared service adjustment only: it applies equally to both key choices.
const MAKE_SERVICE_ADJUSTMENTS_PENCE: Record<string, number> = {
  "aston martin": 5_000,
  audi: 2_000,
  bentley: 6_000,
  bmw: 2_500,
  jaguar: 2_500,
  "land rover": 3_500,
  lexus: 2_000,
  maserati: 4_000,
  "mercedes-benz": 2_500,
  porsche: 4_000,
  tesla: 3_500,
};

const ALL_KEYS_LOST_SERVICE_ADJUSTMENT_PENCE = 5_500;
const CUSTOMER_PRICE_ROUNDING_PENCE = 500;

function normaliseMake(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function roundCustomerPrice(valuePence: number) {
  return Math.ceil(valuePence / CUSTOMER_PRICE_ROUNDING_PENCE) * CUSTOMER_PRICE_ROUNDING_PENCE;
}

function priceBandForYear(yearFrom: number) {
  return PRICE_BANDS.find((band) => yearFrom <= band.maximumStartYear) ?? PRICE_BANDS[PRICE_BANDS.length - 1];
}

export function automatedPricesForVehicle(
  vehicle: PriceableVehicle,
  serviceType: AutomatedPricingService,
): AutomatedPrice[] {
  const band = priceBandForYear(vehicle.yearFrom);
  const makeAdjustment = MAKE_SERVICE_ADJUSTMENTS_PENCE[normaliseMake(vehicle.make)] ?? 0;
  const serviceAdjustment = serviceType === "all_keys_lost"
    ? ALL_KEYS_LOST_SERVICE_ADJUSTMENT_PENCE
    : 0;
  const serviceChargePence = band.serviceChargePence + makeAdjustment + serviceAdjustment;

  return [
    {
      keyType: "aftermarket",
      displayName: "Aftermarket key",
      serviceChargePence,
      estimatedPartsCostPence: band.aftermarketPartsPence,
      totalPricePence: roundCustomerPrice(serviceChargePence + band.aftermarketPartsPence),
    },
    {
      keyType: "universal",
      displayName: "Universal key",
      serviceChargePence,
      estimatedPartsCostPence: band.universalPartsPence,
      totalPricePence: roundCustomerPrice(serviceChargePence + band.universalPartsPence),
    },
  ];
}
