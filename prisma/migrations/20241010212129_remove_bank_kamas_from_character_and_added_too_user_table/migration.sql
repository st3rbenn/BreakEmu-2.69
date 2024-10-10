/*
  Warnings:

  - You are about to drop the column `bankKamas` on the `character` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `character` DROP COLUMN `bankKamas`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `bankKamas` INTEGER NOT NULL DEFAULT 0;
