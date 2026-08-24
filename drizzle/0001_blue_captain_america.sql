CREATE TABLE `admin_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`admin_email` text NOT NULL,
	`auth_updated_at` text NOT NULL,
	`created_at` text NOT NULL,
	`last_used_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `admin_sessions_user_idx` ON `admin_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `admin_sessions_email_idx` ON `admin_sessions` (`admin_email`);