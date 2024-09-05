/*
  Warnings:

  - You are about to drop the `characterItemIdMapper` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `characterItemIdMapper` DROP FOREIGN KEY `characterItemIdMapper_uuid_fkey`;

-- DropTable
DROP TABLE `characterItemIdMapper`;
