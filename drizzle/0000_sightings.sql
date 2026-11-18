CREATE TABLE `sightings` (
  `id` text PRIMARY KEY NOT NULL,
  `account_id` text NOT NULL,
  `name` text NOT NULL,
  `category` text NOT NULL CHECK (`category` IN ('stray', 'pet', 'cafe', 'community')),
  `city` text NOT NULL,
  `location` text NOT NULL,
  `lat` real NOT NULL,
  `lng` real NOT NULL,
  `note` text NOT NULL,
  `observed` text NOT NULL,
  `photo` text NOT NULL,
  `status` text NOT NULL DEFAULT 'pending' CHECK (`status` IN ('pending', 'approved', 'rejected')),
  `created_at` integer NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE INDEX `sightings_public_idx` ON `sightings` (`status`, `observed`, `created_at`);
--> statement-breakpoint
CREATE INDEX `sightings_account_idx` ON `sightings` (`account_id`, `created_at`);
