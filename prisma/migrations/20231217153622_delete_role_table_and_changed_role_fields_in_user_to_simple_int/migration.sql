/*
  Warnings:

  - You are about to drop the `role` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `user_roleId_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE `role`;
