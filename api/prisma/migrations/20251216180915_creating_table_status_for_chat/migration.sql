/*
  Warnings:

  - The values [finished,started,unfinished] on the enum `Steps` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isActive` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `status` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('open', 'finished', 'unfinished');

-- AlterEnum
BEGIN;
CREATE TYPE "Steps_new" AS ENUM ('business_redirect', 'contact_reason', 'place_order_pizza', 'place_order_burger', 'place_order_fihass', 'report_problem', 'attendant');
ALTER TABLE "Chat" ALTER COLUMN "currentStep" TYPE "Steps_new" USING ("currentStep"::text::"Steps_new");
ALTER TYPE "Steps" RENAME TO "Steps_old";
ALTER TYPE "Steps_new" RENAME TO "Steps";
DROP TYPE "public"."Steps_old";
COMMIT;

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "isActive",
ADD COLUMN     "status" "ChatStatus" NOT NULL;
