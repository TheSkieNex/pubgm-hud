PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_team_points` (
	`id` integer PRIMARY KEY NOT NULL,
	`table_id` integer NOT NULL,
	`db_team_id` integer NOT NULL,
	`team_id` integer NOT NULL,
	`points` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`table_id`) REFERENCES `tables`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`db_team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_team_points`("id", "table_id", "db_team_id", "team_id", "points") SELECT "id", "table_id", "db_team_id", "team_id", "points" FROM `team_points`;--> statement-breakpoint
DROP TABLE `team_points`;--> statement-breakpoint
ALTER TABLE `__new_team_points` RENAME TO `team_points`;--> statement-breakpoint
PRAGMA foreign_keys=ON;