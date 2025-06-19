CREATE TABLE `lottie_layers` (
	`id` integer PRIMARY KEY NOT NULL,
	`file-id` integer NOT NULL,
	`layerIndex` integer NOT NULL,
	FOREIGN KEY (`file-id`) REFERENCES `lottie_files`(`id`) ON UPDATE no action ON DELETE cascade
);
