CREATE TABLE `article_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`authorName` varchar(120) NOT NULL,
	`body` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `article_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`kind` varchar(24) NOT NULL DEFAULT 'image',
	`source` text NOT NULL,
	`placement` varchar(24) NOT NULL DEFAULT 'middle',
	`captionEn` varchar(240) NOT NULL DEFAULT '',
	`captionAr` varchar(240) NOT NULL DEFAULT '',
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_media_id` PRIMARY KEY(`id`)
);
