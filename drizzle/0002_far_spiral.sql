CREATE TABLE `table` (
	`id` integer PRIMARY KEY NOT NULL,
	`uuid` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `team_points` ADD `table_id` integer NOT NULL REFERENCES table(id);--> statement-breakpoint
ALTER TABLE `teams` ADD `table_id` integer NOT NULL REFERENCES table(id);