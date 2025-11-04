CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`dateStart` timestamp NOT NULL,
	`dateEnd` timestamp,
	`location` varchar(255),
	`description` text,
	`floorPlanImageUrl` text,
	`floorPlanImageKey` varchar(255),
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `exhibitors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`logoUrl` text,
	`logoKey` varchar(255),
	`description` text,
	`website` varchar(255),
	`category` varchar(100),
	`boothNumber` varchar(50),
	`positionX` float,
	`positionY` float,
	`featured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exhibitors_id` PRIMARY KEY(`id`)
);
