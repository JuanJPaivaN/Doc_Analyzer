/*
  Warnings:

  - The primary key for the `DocumentAnalysis` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "DocumentAnalysis" DROP CONSTRAINT "DocumentAnalysis_pkey",
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileType" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "DocumentAnalysis_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DocumentAnalysis_id_seq";

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
