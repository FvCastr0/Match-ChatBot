/*
  Warnings:

  - Added the required column `hasAnActiveChat` to the `Costumer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastMessageContent` to the `Costumer` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Costumer" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "phone" BIGINT NOT NULL,
    "lastMessageTime" INTEGER NOT NULL,
    "lastMessageContent" TEXT NOT NULL,
    "hasAnActiveChat" BOOLEAN NOT NULL
);
INSERT INTO "new_Costumer" ("id", "lastMessageTime", "phone") SELECT "id", "lastMessageTime", "phone" FROM "Costumer";
DROP TABLE "Costumer";
ALTER TABLE "new_Costumer" RENAME TO "Costumer";
CREATE UNIQUE INDEX "Costumer_phone_key" ON "Costumer"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
