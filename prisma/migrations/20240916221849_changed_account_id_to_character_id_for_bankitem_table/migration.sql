/*
  Warnings:

  - The primary key for the `bankItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountId` on the `bankItem` table. All the data in the column will be lost.
  - Added the required column `characterId` to the `bankItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bankItem` DROP PRIMARY KEY,
    DROP COLUMN `accountId`,
    ADD COLUMN `characterId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`characterId`, `itemId`);
