/*
  Warnings:

  - Added the required column `pharmaceuticalForm` to the `Medication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchasePrice` to the `Medication` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Medication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "pharmaceuticalForm" TEXT NOT NULL,
    "purchasePrice" REAL NOT NULL,
    "price" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "expirationDate" DATETIME NOT NULL,
    "barcode" TEXT,
    "isAvailableForSale" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Medication" ("barcode", "createdAt", "expirationDate", "id", "name", "price", "quantity", "updatedAt", "pharmaceuticalForm", "purchasePrice", "isAvailableForSale") SELECT "barcode", "createdAt", "expirationDate", "id", "name", "price", "quantity", "updatedAt", '', 0.0, false FROM "Medication";
DROP TABLE "Medication";
ALTER TABLE "new_Medication" RENAME TO "Medication";
CREATE UNIQUE INDEX "Medication_barcode_key" ON "Medication"("barcode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
