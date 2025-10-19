-- CreateTable
CREATE TABLE "ShiftPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "targetMonth" DATETIME NOT NULL,
    "preferredShifts" TEXT NOT NULL,
    "notPreferred" TEXT,
    "maxDaysPerWeek" INTEGER,
    "comment" TEXT,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT '提出済み',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ShiftPreference_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "preferredShiftTypes" TEXT,
    "unavailableReason" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 50,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Availability_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShiftGenerationConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetMonth" DATETIME NOT NULL,
    "minStaffPerShift" INTEGER NOT NULL DEFAULT 3,
    "maxStaffPerShift" INTEGER NOT NULL DEFAULT 8,
    "prioritizePreferences" BOOLEAN NOT NULL DEFAULT true,
    "balanceWorkload" BOOLEAN NOT NULL DEFAULT true,
    "lastGeneratedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT '未生成',
    "resultSummary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "ShiftPreference_staffId_idx" ON "ShiftPreference"("staffId");

-- CreateIndex
CREATE INDEX "ShiftPreference_targetMonth_idx" ON "ShiftPreference"("targetMonth");

-- CreateIndex
CREATE INDEX "ShiftPreference_status_idx" ON "ShiftPreference"("status");

-- CreateIndex
CREATE INDEX "Availability_staffId_idx" ON "Availability"("staffId");

-- CreateIndex
CREATE INDEX "Availability_date_idx" ON "Availability"("date");

-- CreateIndex
CREATE INDEX "Availability_isAvailable_idx" ON "Availability"("isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_staffId_date_key" ON "Availability"("staffId", "date");

-- CreateIndex
CREATE INDEX "Notification_staffId_idx" ON "Notification"("staffId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "ShiftGenerationConfig_targetMonth_idx" ON "ShiftGenerationConfig"("targetMonth");
