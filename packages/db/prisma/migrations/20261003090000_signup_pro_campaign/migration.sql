-- No campaign is enabled by this migration. Activation records a reviewed baseline.
CREATE TABLE "signup_pro_campaigns" (
  "id" TEXT PRIMARY KEY,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "baselineUserCount" INTEGER NOT NULL CHECK ("baselineUserCount" >= 0),
  "capacity" INTEGER NOT NULL DEFAULT 50 CHECK ("capacity" > 0),
  "grantedCount" INTEGER NOT NULL DEFAULT 0 CHECK ("grantedCount" >= 0 AND "grantedCount" <= "capacity"),
  "durationDays" INTEGER NOT NULL DEFAULT 30 CHECK ("durationDays" > 0),
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "signup_pro_grants" (
  "id" TEXT PRIMARY KEY,
  "campaignId" TEXT NOT NULL REFERENCES "signup_pro_campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "slot" INTEGER NOT NULL CHECK ("slot" > 0),
  "userId" TEXT REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "emailHash" TEXT NOT NULL,
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "signup_pro_grants_dates_check" CHECK ("expiresAt" > "grantedAt")
);
CREATE UNIQUE INDEX "signup_pro_grants_campaignId_slot_key" ON "signup_pro_grants"("campaignId", "slot");
CREATE UNIQUE INDEX "signup_pro_grants_campaignId_userId_key" ON "signup_pro_grants"("campaignId", "userId");
CREATE UNIQUE INDEX "signup_pro_grants_campaignId_emailHash_key" ON "signup_pro_grants"("campaignId", "emailHash");
CREATE INDEX "signup_pro_grants_userId_idx" ON "signup_pro_grants"("userId");

-- Signup, slot allocation, entitlement and notification commit or roll back together.
-- No Payment or Subscription is created: this gift can never schedule a charge.
CREATE FUNCTION grant_signup_pro(target_user_id TEXT) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  account_row "users"%ROWTYPE;
  campaign_row "signup_pro_campaigns"%ROWTYPE;
  identity_hash TEXT;
  expiry TIMESTAMP(3);
BEGIN
  SELECT * INTO account_row FROM "users" WHERE "id" = target_user_id FOR UPDATE;
  IF NOT FOUND OR account_row."role" <> 'USER' OR account_row."deletionRequestedAt" IS NOT NULL THEN RETURN false; END IF;
  SELECT * INTO campaign_row FROM "signup_pro_campaigns"
    WHERE "id" = 'signup-pro-20261003' AND "enabled" AND "startsAt" <= account_row."createdAt"
      AND "grantedCount" < "capacity" FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  identity_hash := encode(sha256(convert_to(lower(btrim(account_row."email")), 'UTF8')), 'hex');
  IF EXISTS (SELECT 1 FROM "signup_pro_grants" WHERE "campaignId" = campaign_row."id"
    AND ("userId" = target_user_id OR "emailHash" = identity_hash)) THEN RETURN false; END IF;
  expiry := GREATEST(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', COALESCE(account_row."planExpiresAt", CURRENT_TIMESTAMP AT TIME ZONE 'UTC'))
    + make_interval(days => campaign_row."durationDays");
  UPDATE "signup_pro_campaigns" SET "grantedCount" = "grantedCount" + 1 WHERE "id" = campaign_row."id";
  INSERT INTO "signup_pro_grants" ("id", "campaignId", "slot", "userId", "emailHash", "expiresAt")
    VALUES (gen_random_uuid()::text, campaign_row."id", campaign_row."grantedCount" + 1, target_user_id, identity_hash, expiry);
  UPDATE "users" SET "plan" = 'PRO', "planExpiresAt" = expiry, "planCancelRequested" = false,
    "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = target_user_id;
  INSERT INTO "notifications" ("id", "userId", "type", "title", "body", "link") VALUES (
    gen_random_uuid()::text, target_user_id, 'promo', '註冊禮已到帳：免費 Pro 30 天',
    '你已獲得限量新會員 Pro 贈禮，可使用至 ' || to_char(expiry + interval '8 hours', 'YYYY/MM/DD HH24:MI') ||
    '（台灣時間）。無需綁定信用卡；贈送期間不收費，到期不會自動扣款。', '/upgrade');
  RETURN true;
END;
$$;
CREATE FUNCTION grant_signup_pro_after_insert() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  PERFORM grant_signup_pro(NEW."id");
  RETURN NEW;
END;
$$;
CREATE TRIGGER "users_signup_pro_gift" AFTER INSERT ON "users"
  FOR EACH ROW EXECUTE FUNCTION grant_signup_pro_after_insert();
