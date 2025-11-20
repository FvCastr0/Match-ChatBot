-- CreateTable
CREATE TABLE "Costumer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "phone" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Costumer_phone_key" ON "Costumer"("phone");
