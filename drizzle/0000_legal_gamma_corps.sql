CREATE TABLE `shouts` (
	`id` text PRIMARY KEY NOT NULL,
	`serial` integer DEFAULT 0 NOT NULL,
	`from_ip` text,
	`pending` integer DEFAULT true NOT NULL,
	`text` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
