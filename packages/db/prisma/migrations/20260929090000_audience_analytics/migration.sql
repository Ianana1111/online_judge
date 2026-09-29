-- Additive: existing pageviews remain legacy data, never inferred to be unique people.
ALTER TABLE "page_views"
 ADD COLUMN "eventKey" TEXT,
 ADD COLUMN "visitorId" TEXT,
 ADD COLUMN "sessionId" TEXT,
 ADD COLUMN "audience" TEXT,
 ADD COLUMN "subscriber" BOOLEAN,
 ADD COLUMN "engaged" BOOLEAN NOT NULL DEFAULT false,
 ADD COLUMN "acquisition" TEXT,
 ADD COLUMN "country" TEXT,
 ADD COLUMN "region" TEXT;
CREATE UNIQUE INDEX "page_views_eventKey_key" ON "page_views"("eventKey");
CREATE INDEX "page_views_visitorId_createdAt_idx" ON "page_views"("visitorId", "createdAt");
