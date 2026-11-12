-- The new-member Pro gift has ended: accounts created from now on get no free Pro.
-- Gifts already granted are kept as they are (signup_pro_grants and each user's planExpiresAt are
-- not touched), so those members keep Pro until their gift expires.
DROP TRIGGER IF EXISTS "users_signup_pro_gift" ON "users";
DROP FUNCTION IF EXISTS grant_signup_pro_after_insert();
DROP FUNCTION IF EXISTS grant_signup_pro(TEXT);
UPDATE "signup_pro_campaigns" SET "enabled" = false WHERE "enabled";
