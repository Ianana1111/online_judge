ALTER TABLE "users"
  ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "authVersion" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "mfaSecretEncrypted" TEXT,
  ADD COLUMN "mfaEnabledAt" TIMESTAMP(3),
  ADD COLUMN "mfaLastStep" INTEGER,
  ADD COLUMN "mfaRecoveryHashes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE TABLE "auth_challenges" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "purpose" TEXT NOT NULL CHECK ("purpose" IN ('PASSWORD_RESET', 'VERIFY_EMAIL')),
  "tokenHash" TEXT NOT NULL UNIQUE,
  "tokenEncrypted" TEXT,
  "targetEmail" TEXT NOT NULL,
  "authVersion" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentAt" TIMESTAMP(3),
  "deliveryAttempts" INTEGER NOT NULL DEFAULT 0,
  "nextDeliveryAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leaseUntil" TIMESTAMP(3),
  UNIQUE ("userId", "purpose")
);
CREATE INDEX "auth_challenges_sentAt_nextDeliveryAt_idx" ON "auth_challenges"("sentAt", "nextDeliveryAt");

CREATE TABLE "security_events" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "kind" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "security_events_userId_createdAt_idx" ON "security_events"("userId", "createdAt");
