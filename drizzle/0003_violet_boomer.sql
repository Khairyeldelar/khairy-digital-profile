ALTER TABLE `projects` ADD COLUMN `articleBodyEn` TEXT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD COLUMN `articleBodyAr` TEXT NULL;--> statement-breakpoint
UPDATE `projects` SET `articleBodyEn` = '' WHERE `articleBodyEn` IS NULL;--> statement-breakpoint
UPDATE `projects` SET `articleBodyAr` = '' WHERE `articleBodyAr` IS NULL;--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `articleBodyEn` TEXT NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `articleBodyAr` TEXT NOT NULL;
