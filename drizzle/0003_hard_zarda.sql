CREATE TABLE `event_sponsors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`sponsorId` int NOT NULL,
	`tier` enum('diamond','gold','silver','bronze') NOT NULL,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_sponsors_id` PRIMARY KEY(`id`)
);
