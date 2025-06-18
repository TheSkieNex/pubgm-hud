CREATE TABLE `lottie_files` (
	`id` integer PRIMARY KEY NOT NULL,
	`uuid` text NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
