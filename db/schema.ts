// Intentionally empty by default.
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * One row represents one vehicle/key application. Nullable boolean fields are
 * intentional: an unanswered compatibility question must not be mistaken for
 * a confirmed "no".
 */
export const keyRecords = sqliteTable(
  "key_records",
  {
    id: text("id").primaryKey(),
    make: text("make").notNull(),
    model: text("model").notNull(),
    yearFrom: integer("year_from").notNull(),
    yearTo: integer("year_to"),

    carPhotoKey: text("car_photo_key"),
    oemKeyPhotoKey: text("oem_key_photo_key"),
    universalKeyPhotoKey: text("universal_key_photo_key"),

    transponderClonable: integer("transponder_clonable", {
      mode: "boolean",
    }),
    powerSupplyRequirement: text("power_supply_requirement"),
    aklCompatible: integer("akl_compatible", { mode: "boolean" }),
    addKeyCompatible: integer("add_key_compatible", { mode: "boolean" }),

    aklPinMethod: text("akl_pin_method"),
    aklPinSupplier: text("akl_pin_supplier"),
    addKeyPinMethod: text("add_key_pin_method"),
    addKeyPinSupplier: text("add_key_pin_supplier"),

    keyCloning: integer("key_cloning", { mode: "boolean" }),
    keyBlankCode: text("key_blank_code"),
    lishiInStock: integer("lishi_in_stock", { mode: "boolean" }),
    keyBlanksInStock: integer("key_blanks_in_stock", { mode: "boolean" }),

    universalKeyCompatible: integer("universal_key_compatible", {
      mode: "boolean",
    }),
    compatibleUniversalKeys: text("compatible_universal_keys"),
    universalKeyInStock: integer("universal_key_in_stock", {
      mode: "boolean",
    }),
    universalKeySupplier: text("universal_key_supplier"),
    oemKeyInStock: integer("oem_key_in_stock", { mode: "boolean" }),
    oemKeySupplier: text("oem_key_supplier"),

    leadTime: text("lead_time"),
    oemPricePence: integer("oem_price_pence"),
    universalPricePence: integer("universal_price_pence"),
    notes: text("notes"),

    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("key_records_vehicle_idx").on(
      table.make,
      table.model,
      table.yearFrom,
    ),
    index("key_records_updated_at_idx").on(table.updatedAt),
  ],
);

export type KeyRecord = typeof keyRecords.$inferSelect;
export type NewKeyRecord = typeof keyRecords.$inferInsert;
