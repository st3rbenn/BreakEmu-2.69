/*
  Warnings:

  - You are about to drop the column `npcspawnId` on the `npc` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `npc` DROP FOREIGN KEY `npc_npcspawnId_fkey`;

-- AlterTable
ALTER TABLE `npc` DROP COLUMN `npcspawnId`;

-- CreateTable
CREATE TABLE `auctionHouse` (
    `id` INTEGER NOT NULL,
    `quantities` VARCHAR(191) NOT NULL,
    `itemsType` VARCHAR(191) NOT NULL,
    `maxItemPerAccount` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auctionHouseItem` (
    `uid` INTEGER NOT NULL,
    `gId` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `sold` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `effects` JSON NOT NULL,
    `apparenceId` INTEGER NOT NULL,
    `look` TEXT NULL,
    `auctionHouseId` INTEGER NOT NULL,
    `sellerId` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`uid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `auctionHouseItem` ADD CONSTRAINT `auctionHouseItem_auctionHouseId_fkey` FOREIGN KEY (`auctionHouseId`) REFERENCES `auctionHouse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auctionHouseItem` ADD CONSTRAINT `auctionHouseItem_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
