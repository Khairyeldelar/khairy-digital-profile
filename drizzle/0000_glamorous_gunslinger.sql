CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titleEn` varchar(160) NOT NULL,
	`titleAr` varchar(160) NOT NULL,
	`descriptionEn` text NOT NULL,
	`descriptionAr` text NOT NULL,
	`typeEn` varchar(120) NOT NULL,
	`typeAr` varchar(120) NOT NULL,
	`href` text NOT NULL,
	`imageKey` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_profile` (
	`id` int NOT NULL DEFAULT 1,
	`name` varchar(160) NOT NULL DEFAULT 'Khairy Eid Aly',
	`roleEn` varchar(240) NOT NULL DEFAULT 'Developer • Creator • Digital Projects',
	`roleAr` varchar(240) NOT NULL DEFAULT 'مطور • صانع محتوى • مشاريع رقمية',
	`bioEn` text NOT NULL,
	`bioAr` text NOT NULL,
	`locationEn` varchar(160) NOT NULL,
	`locationAr` varchar(160) NOT NULL,
	`portraitKey` text,
	`coverKey` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_profile_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `social_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` varchar(40) NOT NULL,
	`handleEn` varchar(160) NOT NULL,
	`handleAr` varchar(160) NOT NULL,
	`href` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `social_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `social_links_platform_unique` UNIQUE(`platform`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
