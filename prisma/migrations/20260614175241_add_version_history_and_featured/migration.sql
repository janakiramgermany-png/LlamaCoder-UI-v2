-- AlterTable
ALTER TABLE "GeneratedApp" ADD COLUMN     "description" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "title" TEXT;

-- CreateTable
CREATE TABLE "AppVersion" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppVersion_appId_idx" ON "AppVersion"("appId");

-- CreateIndex
CREATE INDEX "AppVersion_createdAt_idx" ON "AppVersion"("createdAt");

-- CreateIndex
CREATE INDEX "GeneratedApp_featured_idx" ON "GeneratedApp"("featured");

-- CreateIndex
CREATE INDEX "GeneratedApp_createdAt_idx" ON "GeneratedApp"("createdAt");

-- AddForeignKey
ALTER TABLE "AppVersion" ADD CONSTRAINT "AppVersion_appId_fkey" FOREIGN KEY ("appId") REFERENCES "GeneratedApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
