ALTER TABLE `lottie_layers` RENAME COLUMN "layerIndex" TO "layer_index";--> statement-breakpoint
ALTER TABLE `lottie_layers` ADD `out_point` integer DEFAULT 0 NOT NULL;