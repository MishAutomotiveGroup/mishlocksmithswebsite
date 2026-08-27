// Intentionally empty by default.
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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
    generation: text("generation").notNull().default(""),
    profileName: text("profile_name").notNull().default(""),

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

    // Kept for backwards compatibility with records created before lead times
    // were split by remote type.
    leadTime: text("lead_time"),
    universalLeadTime: text("universal_lead_time"),
    aftermarketLeadTime: text("aftermarket_lead_time"),
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

/**
 * Durable, revocable admin browser sessions. The browser receives the random
 * token while D1 stores only its SHA-256 digest, so a database leak does not
 * expose usable login cookies.
 */
export const adminSessions = sqliteTable(
  "admin_sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id").notNull(),
    adminEmail: text("admin_email").notNull(),
    authUpdatedAt: text("auth_updated_at").notNull(),
    createdAt: text("created_at").notNull(),
    lastUsedAt: text("last_used_at").notNull(),
  },
  (table) => [
    index("admin_sessions_user_idx").on(table.userId),
    index("admin_sessions_email_idx").on(table.adminEmail),
  ],
);

/**
 * A privacy-conscious record of each public quote lookup. It stores only the
 * vehicle details needed to follow up on a quote—no email address, telephone
 * number or other contact data is collected by the search form.
 */
export const quoteSearches = sqliteTable(
  "quote_searches",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    createdAt: text("created_at").notNull(),
    make: text("make").notNull(),
    model: text("model").notNull(),
    year: integer("year").notNull(),
    yearTo: integer("year_to"),
    generation: text("generation"),
    serviceType: text("service_type").notNull(),
    hasWorkingKey: integer("has_working_key", { mode: "boolean" }).notNull(),
    resultStatus: text("result_status").notNull(),
    sourcePage: text("source_page").notNull(),
    referenceNumber: integer("reference_number"),
  },
  (table) => [
    index("quote_searches_created_at_idx").on(table.createdAt),
    uniqueIndex("quote_searches_reference_number_unique").on(table.referenceNumber),
  ],
);

export type KeyRecord = typeof keyRecords.$inferSelect;
export type NewKeyRecord = typeof keyRecords.$inferInsert;
