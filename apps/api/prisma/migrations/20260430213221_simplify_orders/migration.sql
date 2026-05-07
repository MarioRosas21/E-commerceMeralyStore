/*
  Warnings:

  - You are about to drop the column `customer_address` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `customer_phone` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "customer_address",
DROP COLUMN "customer_phone";
