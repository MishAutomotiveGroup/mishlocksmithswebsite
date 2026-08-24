ALTER TABLE `key_records` ADD `generation` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `quote_searches` ADD `year_to` integer;--> statement-breakpoint
ALTER TABLE `quote_searches` ADD `generation` text;--> statement-breakpoint
ALTER TABLE `quote_searches` ADD `reference_number` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `quote_searches_reference_number_unique` ON `quote_searches` (`reference_number`);