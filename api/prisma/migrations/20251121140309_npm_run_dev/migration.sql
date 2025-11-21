/*
  Warnings:

  - You are about to drop the column `lastMessage` on the `Costumer` table. All the data in the column will be lost.
  - Added the required column `lastMessageTime` to the `Costumer` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Costumer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phone" INTEGER NOT NULL,
    "lastMessageTime" INTEGER NOT NULL
);
INSERT INTO "new_Costumer" ("id", "phone") SELECT "id", "phone" FROM "Costumer";
DROP TABLE "Costumer";
ALTER TABLE "new_Costumer" RENAME TO "Costumer";
CREATE UNIQUE INDEX "Costumer_phone_key" ON "Costumer"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
