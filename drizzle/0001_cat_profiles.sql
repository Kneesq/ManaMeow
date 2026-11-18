ALTER TABLE `sightings` ADD COLUMN `age_months` integer CHECK (`age_months` IS NULL OR (typeof(`age_months`) = 'integer' AND `age_months` BETWEEN 0 AND 480));
--> statement-breakpoint
ALTER TABLE `sightings` ADD COLUMN `gender` text NOT NULL DEFAULT 'unknown' CHECK (`gender` IN ('female', 'male', 'unknown'));
--> statement-breakpoint
CREATE TABLE `cat_photos` (
  `id` text PRIMARY KEY NOT NULL,
  `cat_id` text NOT NULL,
  `account_id` text NOT NULL,
  `caption` text NOT NULL,
  `photo` text NOT NULL,
  `status` text NOT NULL DEFAULT 'pending' CHECK (`status` IN ('pending', 'approved', 'rejected')),
  `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `cat_photos_gallery_idx` ON `cat_photos` (`cat_id`, `status`, `created_at`);
--> statement-breakpoint
CREATE INDEX `cat_photos_review_idx` ON `cat_photos` (`status`, `created_at`);
