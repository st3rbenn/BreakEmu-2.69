/*
  Warnings:

  - The primary key for the `bankItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `itemId` on the `bankItem` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `bankItem` DROP PRIMARY KEY,
    MODIFY `itemId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`accountId`, `itemId`);
