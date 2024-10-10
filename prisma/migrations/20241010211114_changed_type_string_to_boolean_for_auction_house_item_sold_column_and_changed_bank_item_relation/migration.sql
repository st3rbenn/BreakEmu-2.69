/*
  Warnings:

  - You are about to alter the column `sold` on the `auctionHouseItem` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `TinyInt`.
  - The primary key for the `bankItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `characterId` on the `bankItem` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `bankItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serverId` to the `bankItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `bankItem` DROP FOREIGN KEY `bankItem_characterId_fkey`;

-- AlterTable
ALTER TABLE `auctionHouseItem` MODIFY `sold` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `bankItem` DROP PRIMARY KEY,
    DROP COLUMN `characterId`,
    ADD COLUMN `accountId` INTEGER NOT NULL,
    ADD COLUMN `serverId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`accountId`, `serverId`, `itemId`);

-- AddForeignKey
ALTER TABLE `bankItem` ADD CONSTRAINT `bankItem_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bankItem` ADD CONSTRAINT `bankItem_serverId_fkey` FOREIGN KEY (`serverId`) REFERENCES `world`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
