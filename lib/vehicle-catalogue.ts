import catalogue from "@/content/vehicleGenerations.json";

export type VehicleCatalogueOption = {
  id: string;
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number | null;
  generation: string;
};

function optionId(option: Omit<VehicleCatalogueOption, "id">) {
  return [
    option.make,
    option.model,
    option.yearFrom,
    option.yearTo ?? "present",
    option.generation,
  ].join("::");
}

export const vehicleCatalogueOptions: VehicleCatalogueOption[] = catalogue.makes.flatMap((make) => (
  make.models.flatMap((model) => (
    model.generations.map((generation) => {
      const option = {
        make: make.name,
        model: model.name,
        yearFrom: generation.yearFrom,
        yearTo: generation.yearTo,
        generation: generation.name,
      };

      return {
        id: optionId(option),
        ...option,
      };
    })
  ))
));

const optionsById = new Map(vehicleCatalogueOptions.map((option) => [option.id, option]));

export function findVehicleCatalogueOption(id: string) {
  return optionsById.get(id) ?? null;
}
