ALTER TABLE cat_photos ADD COLUMN shared integer NOT NULL DEFAULT 1 CHECK (shared IN (0, 1));
--> statement-breakpoint
ALTER TABLE cat_photos ADD COLUMN client_request_id text;
--> statement-breakpoint
CREATE UNIQUE INDEX cat_photos_request_idx ON cat_photos(account_id, client_request_id);
--> statement-breakpoint
CREATE INDEX cat_photos_personal_idx ON cat_photos(cat_id, account_id, created_at);
--> statement-breakpoint
CREATE INDEX cat_photos_collection_idx ON cat_photos(account_id, cat_id, created_at DESC, id DESC);
--> statement-breakpoint
CREATE TABLE cat_nicknames (
  account_id text NOT NULL,
  cat_id text NOT NULL,
  nickname text NOT NULL,
  PRIMARY KEY (account_id, cat_id)
);
--> statement-breakpoint
CREATE TABLE photo_likes (
  cat_id text NOT NULL,
  photo_id text NOT NULL,
  account_id text NOT NULL,
  PRIMARY KEY (cat_id, photo_id, account_id)
);
--> statement-breakpoint
CREATE TABLE photo_comments (
  id text PRIMARY KEY NOT NULL,
  cat_id text NOT NULL,
  photo_id text NOT NULL,
  account_id text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX photo_comments_gallery_idx ON photo_comments(cat_id, photo_id, created_at);
--> statement-breakpoint
CREATE INDEX photo_comments_account_idx ON photo_comments(account_id, created_at);
--> statement-breakpoint
CREATE INDEX photo_comments_review_idx ON photo_comments(status, created_at);
