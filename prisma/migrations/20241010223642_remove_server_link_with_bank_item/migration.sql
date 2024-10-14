/*
  Warnings:

  - The primary key for the `bankItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `serverId` on the `bankItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `bankItem` DROP FOREIGN KEY `bankItem_serverId_fkey`;

-- AlterTable
ALTER TABLE `bankItem` DROP PRIMARY KEY,
    DROP COLUMN `serverId`,
    ADD PRIMARY KEY (`accountId`, `itemId`);
