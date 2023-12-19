/*
  Warnings:

  - You are about to drop the column `roleId` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `user_roleId_fkey` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `roleId`;
