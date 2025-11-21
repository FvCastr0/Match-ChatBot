/*
  Warnings:

  - The primary key for the `Costumer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Costumer` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Costumer" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "phone" INTEGER NOT NULL,
    "lastMessageTime" INTEGER NOT NULL
);
INSERT INTO "new_Costumer" ("id", "lastMessageTime", "phone") SELECT "id", "lastMessageTime", "phone" FROM "Costumer";
DROP TABLE "Costumer";
ALTER TABLE "new_Costumer" RENAME TO "Costumer";
CREATE UNIQUE INDEX "Costumer_phone_key" ON "Costumer"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
