CREATE TABLE `invites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(32) NOT NULL,
	`email` varchar(320),
	`role` enum('user','admin') NOT NULL,
	`createdBy` int NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`usedBy` int,
	`status` enum('pending','used','expired','revoked') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invites_id` PRIMARY KEY(`id`),
	CONSTRAINT `invites_token_unique` UNIQUE(`token`)
);
