CREATE TABLE `overall_results_points` (
	`id` integer PRIMARY KEY NOT NULL,
	`table_id` integer NOT NULL,
	`team_id` integer NOT NULL,
	`wwcds` integer DEFAULT 0 NOT NULL,
	`placement_pts` integer DEFAULT 0 NOT NULL,
	`elims` integer DEFAULT 0 NOT NULL,
	`total` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lottie_files` (
	`id` integer PRIMARY KEY NOT NULL,
	`uuid` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lottie_layers` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`file_id` integer NOT NULL,
	`layer_index` integer NOT NULL,
	`out_point` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `lottie_files`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tables` (
	`id` integer PRIMARY KEY NOT NULL,
	`uuid` text NOT NULL,
	`name` text NOT NULL,
	`large_logo_size` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` integer PRIMARY KEY NOT NULL,
	`table_id` integer NOT NULL,
	`team_id` integer NOT NULL,
	`name` text NOT NULL,
	`tag` text NOT NULL,
	`match_elims` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`table_id`) REFERENCES `tables`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `team_points` (
	`id` integer PRIMARY KEY NOT NULL,
	`table_id` integer NOT NULL,
	`team_id` integer NOT NULL,
	`points` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`table_id`) REFERENCES `tables`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
