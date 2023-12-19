/*
  Warnings:

  - A unique constraint covering the columns `[tagNumber]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `tagNumber` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `user_tagNumber_key` ON `user`(`tagNumber`);
