/*
  Warnings:

  - You are about to drop the column `created_at` on the `auctionHouseItem` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `auctionHouseItem` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `auctionHouseItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `auctionHouseItem` DROP COLUMN `created_at`,
    DROP COLUMN `deleted_at`,
    DROP COLUMN `updated_at`,
    MODIFY `uid` INTEGER NOT NULL AUTO_INCREMENT;
