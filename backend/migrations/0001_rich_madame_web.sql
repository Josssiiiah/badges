CREATE TABLE `pending_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`badge_id` text,
	`organization_id` text,
	`token` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`claimed_at` integer,
	FOREIGN KEY (`badge_id`) REFERENCES `created_badges`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pending_claims_token_unique` ON `pending_claims` (`token`);--> statement-breakpoint
ALTER TABLE `students` ADD `invited` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `students` ADD `invited_at` integer;--> statement-breakpoint
ALTER TABLE `students` ADD `signed_up` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `students` ADD `signed_up_at` integer;