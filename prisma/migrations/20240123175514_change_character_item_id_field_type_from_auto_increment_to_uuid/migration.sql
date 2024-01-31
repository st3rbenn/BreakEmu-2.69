/*
  Warnings:

  - The primary key for the `characterItem` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `characterItem` DROP PRIMARY KEY,
    MODIFY `uid` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`uid`);
