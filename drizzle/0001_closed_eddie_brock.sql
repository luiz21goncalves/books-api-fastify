CREATE TABLE `books` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`cover_url` text NOT NULL,
	`author_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE cascade
);
