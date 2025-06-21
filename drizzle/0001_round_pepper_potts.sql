CREATE TABLE `team_points` (
	`id` integer PRIMARY KEY NOT NULL,
	`team_id` integer NOT NULL,
	`points` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` integer PRIMARY KEY NOT NULL,
	`team_id` integer NOT NULL,
	`name` text NOT NULL,
	`tag` text NOT NULL
);
