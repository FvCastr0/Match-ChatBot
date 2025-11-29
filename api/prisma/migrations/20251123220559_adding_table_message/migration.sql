/*
  Warnings:

  - The values [place_oder_fihass] on the enum `Steps` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `phone` on the `Customer` table. All the data in the column will be lost.
  - Changed the type of `currentStep` on the `Chat` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('CUSTOMER', 'BOT', 'AGENT');

-- CreateEnum
CREATE TYPE "ContactReason" AS ENUM ('order', 'delivery', 'app', 'feedback');

-- AlterEnum
BEGIN;
CREATE TYPE "Steps_new" AS ENUM ('business_redirect', 'contact_reason', 'place_order_pizza', 'place_order_burger', 'place_order_fihass', 'report_problem', 'attendant', 'finished');
ALTER TABLE "Chat" ALTER COLUMN "currentStep" TYPE "Steps_new" USING ("currentStep"::text::"Steps_new");
ALTER TYPE "Steps" RENAME TO "Steps_old";
ALTER TYPE "Steps_new" RENAME TO "Steps";
DROP TYPE "public"."Steps_old";
COMMIT;

-- DropIndex
DROP INDEX "Customer_phone_key";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "contactReason" "ContactReason",
DROP COLUMN "currentStep",
ADD COLUMN     "currentStep" "Steps" NOT NULL;

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "phone";

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "sender" "SenderType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
