/*
  Warnings:

  - The values [delivery,app] on the enum `ContactReason` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContactReason_new" AS ENUM ('order', 'problem', 'feedback');
ALTER TABLE "Chat" ALTER COLUMN "contactReason" TYPE "ContactReason_new" USING ("contactReason"::text::"ContactReason_new");
ALTER TYPE "ContactReason" RENAME TO "ContactReason_old";
ALTER TYPE "ContactReason_new" RENAME TO "ContactReason";
DROP TYPE "public"."ContactReason_old";
COMMIT;
