-- CreateTable
CREATE TABLE "AgentOpsState" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "dispatchEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dailyRunLimit" INTEGER NOT NULL DEFAULT 4,
    "budgetDay" TEXT NOT NULL DEFAULT '',
    "attemptsToday" INTEGER NOT NULL DEFAULT 0,
    "lastCollectedAt" TIMESTAMP(3),
    "monitorError" BOOLEAN NOT NULL DEFAULT false,
    "snapshot" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentOpsState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentOpsCredential" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "AgentOpsCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentOpsIncident" (
    "id" TEXT NOT NULL,
    "activeKey" TEXT,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recoveredAt" TIMESTAMP(3),
    "healthyChecks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AgentOpsIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentOpsRun" (
    "id" TEXT NOT NULL,
    "queueKey" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "incidentId" TEXT,
    "evidence" JSONB NOT NULL,
    "steps" JSONB NOT NULL DEFAULT '[]',
    "stepReceipts" JSONB NOT NULL DEFAULT '[]',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "credentialId" TEXT,
    "leaseHash" TEXT,
    "leaseUntil" TIMESTAMP(3),
    "attemptDeadline" TIMESTAMP(3),
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AgentOpsRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentOpsCredential_tokenHash_key" ON "AgentOpsCredential"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "AgentOpsIncident_activeKey_key" ON "AgentOpsIncident"("activeKey");

-- CreateIndex
CREATE INDEX "AgentOpsIncident_recoveredAt_lastSeenAt_idx" ON "AgentOpsIncident"("recoveredAt", "lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentOpsRun_queueKey_key" ON "AgentOpsRun"("queueKey");

-- CreateIndex
CREATE INDEX "AgentOpsRun_status_availableAt_createdAt_idx" ON "AgentOpsRun"("status", "availableAt", "createdAt");

-- CreateIndex
CREATE INDEX "AgentOpsRun_startedAt_idx" ON "AgentOpsRun"("startedAt");

-- AddForeignKey
ALTER TABLE "AgentOpsRun" ADD CONSTRAINT "AgentOpsRun_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "AgentOpsIncident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentOpsRun" ADD CONSTRAINT "AgentOpsRun_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "AgentOpsCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;
