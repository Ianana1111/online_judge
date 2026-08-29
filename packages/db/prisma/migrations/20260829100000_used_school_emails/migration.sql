-- Anti-abuse ledger for school-email verification: once an email has verified one account, it can
-- never verify another. See UsedSchoolEmail in schema.prisma.

-- CreateTable
CREATE TABLE "used_school_emails" (
    "email" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "used_school_emails_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE INDEX "used_school_emails_userId_idx" ON "used_school_emails"("userId");

-- AddForeignKey
ALTER TABLE "used_school_emails" ADD CONSTRAINT "used_school_emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: every account that already completed verification claims its email retroactively, so
-- verification that already happened is protected going forward too. Ordered by schoolVerifiedAt
-- so if the same email was somehow already used to verify more than one account (the exact abuse
-- this table prevents from now on), whichever verified *first* keeps it — ON CONFLICT DO NOTHING
-- silently drops the later duplicate(s) rather than failing the whole migration.
INSERT INTO "used_school_emails" ("email", "userId", "school", "verifiedAt")
SELECT LOWER(TRIM("schoolEmail")), "id", "school", "schoolVerifiedAt"
FROM "users"
WHERE "schoolVerifiedAt" IS NOT NULL AND "schoolEmail" IS NOT NULL AND "school" IS NOT NULL
ORDER BY "schoolVerifiedAt" ASC
ON CONFLICT ("email") DO NOTHING;
