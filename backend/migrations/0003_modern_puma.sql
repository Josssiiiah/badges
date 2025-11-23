ALTER TABLE `badges` ADD `credential_id` text;--> statement-breakpoint
ALTER TABLE `badges` ADD `signed_credential` text;--> statement-breakpoint
ALTER TABLE `badges` ADD `revoked` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `badges` ADD `revoked_at` integer;--> statement-breakpoint
ALTER TABLE `badges` ADD `revocation_reason` text;--> statement-breakpoint
ALTER TABLE `badges` ADD `expires_at` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `badges_credential_id_unique` ON `badges` (`credential_id`);--> statement-breakpoint
ALTER TABLE `created_badges` ADD `achievement_type` text DEFAULT 'Badge';--> statement-breakpoint
ALTER TABLE `created_badges` ADD `criteria_url` text;--> statement-breakpoint
ALTER TABLE `created_badges` ADD `alignments` text;--> statement-breakpoint
ALTER TABLE `created_badges` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `organizations` ADD `url` text;--> statement-breakpoint
ALTER TABLE `organizations` ADD `email` text;--> statement-breakpoint
ALTER TABLE `organizations` ADD `description` text;--> statement-breakpoint
ALTER TABLE `organizations` ADD `image` text;--> statement-breakpoint
ALTER TABLE `organizations` ADD `public_key` text;