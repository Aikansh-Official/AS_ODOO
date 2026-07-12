ALTER TABLE email_otps
ADD COLUMN IF NOT EXISTS pending_password_hash TEXT;
