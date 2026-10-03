CREATE TABLE `account` (
	`id` varchar(255) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` text,
	`password` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`symbol` varchar(16) NOT NULL,
	`type` varchar(16) NOT NULL,
	`threshold` double NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`last_triggered_at` timestamp,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(16) NOT NULL,
	`summary` text NOT NULL,
	`trend` varchar(16) NOT NULL,
	`drivers` json NOT NULL,
	`risks` json NOT NULL,
	`confidence` double NOT NULL,
	`price_at_gen` double NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(16) NOT NULL,
	`headline` text NOT NULL,
	`source` varchar(255) NOT NULL,
	`url` varchar(1000) NOT NULL,
	`published_at` timestamp NOT NULL,
	CONSTRAINT `news_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_items_url_unique` UNIQUE(`url`)
);
--> statement-breakpoint
CREATE TABLE `quote_latest` (
	`symbol` varchar(16) NOT NULL,
	`price` double NOT NULL,
	`change` double NOT NULL,
	`pct_change` double NOT NULL,
	`high` double NOT NULL,
	`low` double NOT NULL,
	`open` double NOT NULL,
	`prev_close` double NOT NULL,
	`fetched_at` timestamp NOT NULL,
	CONSTRAINT `quote_latest_symbol` PRIMARY KEY(`symbol`)
);
--> statement-breakpoint
CREATE TABLE `quote_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(16) NOT NULL,
	`price` double NOT NULL,
	`ts` timestamp NOT NULL,
	CONSTRAINT `quote_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`ip_address` varchar(255),
	`user_agent` text,
	`user_id` varchar(255) NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `symbols` (
	`symbol` varchar(16) NOT NULL,
	`name` varchar(255) NOT NULL,
	`exchange` varchar(64) NOT NULL,
	`logo` varchar(500),
	`industry` varchar(255),
	CONSTRAINT `symbols_symbol` PRIMARY KEY(`symbol`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(255) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `watchlist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`symbol` varchar(16) NOT NULL,
	`added_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watchlist_items_id` PRIMARY KEY(`id`),
	CONSTRAINT `watchlist_owner_symbol_unique` UNIQUE(`user_id`,`symbol`)
);
--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `quote_snapshots_symbol_ts_idx` ON `quote_snapshots` (`symbol`,`ts`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);