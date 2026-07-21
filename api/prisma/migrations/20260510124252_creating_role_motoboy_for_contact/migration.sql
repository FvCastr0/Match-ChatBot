-- CreateEnum
CREATE TYPE "ContactRole" AS ENUM ('CUSTOMER', 'DRIVER');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "role" "ContactRole" NOT NULL DEFAULT 'CUSTOMER';
