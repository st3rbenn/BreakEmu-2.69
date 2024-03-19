/*
  Warnings:

  - The primary key for the `bankItem` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `bankItem` DROP PRIMARY KEY,
    MODIFY `itemId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`accountId`, `itemId`);
