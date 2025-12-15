-- AlterEnum
ALTER TYPE "Steps" ADD VALUE 'unfinished';

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "startedBy" "SenderType";
