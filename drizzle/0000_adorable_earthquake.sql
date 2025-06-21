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
	`file_id` integer NOT NULL,
	`layer_index` integer NOT NULL,
	`out_point` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`file_id`) REFERENCES `lottie_files`(`id`) ON UPDATE no action ON DELETE cascade
);
