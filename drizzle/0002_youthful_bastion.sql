CREATE TABLE `quote_searches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`make` text NOT NULL,
	`model` text NOT NULL,
	`year` integer NOT NULL,
	`service_type` text NOT NULL,
	`has_working_key` integer NOT NULL,
	`result_status` text NOT NULL,
	`source_page` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `quote_searches_created_at_idx` ON `quote_searches` (`created_at`);