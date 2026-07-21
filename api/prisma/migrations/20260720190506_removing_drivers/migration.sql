/*
  Warnings:

  - The values [DRIVER] on the enum `ContactRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContactRole_new" AS ENUM ('CUSTOMER');
ALTER TABLE "public"."Customer" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Customer" ALTER COLUMN "role" TYPE "ContactRole_new" USING ("role"::text::"ContactRole_new");
ALTER TYPE "ContactRole" RENAME TO "ContactRole_old";
ALTER TYPE "ContactRole_new" RENAME TO "ContactRole";
DROP TYPE "public"."ContactRole_old";
ALTER TABLE "Customer" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
COMMIT;
