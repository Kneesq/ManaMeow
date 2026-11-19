CREATE TABLE local_accounts (
  id text PRIMARY KEY NOT NULL,
  email text NOT NULL UNIQUE,
  password_salt text NOT NULL,
  password_hash text NOT NULL,
  password_scheme text NOT NULL,
  password_iterations integer NOT NULL,
  recovery_hash text NOT NULL,
  credential_version integer NOT NULL DEFAULT 1,
  created_at integer NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE local_sessions (
  token_hash text PRIMARY KEY NOT NULL,
  account_id text NOT NULL REFERENCES local_accounts(id) ON DELETE CASCADE,
  credential_version integer NOT NULL,
  expires_at integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX local_sessions_account_idx ON local_sessions(account_id, credential_version);
--> statement-breakpoint
CREATE INDEX local_sessions_expiry_idx ON local_sessions(expires_at);
--> statement-breakpoint
CREATE TABLE local_auth_limits (
  bucket text PRIMARY KEY NOT NULL,
  attempts integer NOT NULL,
  expires_at integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX local_auth_limits_expiry_idx ON local_auth_limits(expires_at);
