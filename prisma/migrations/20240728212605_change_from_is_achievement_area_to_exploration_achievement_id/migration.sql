/*
  Warnings:

  - You are about to drop the column `isAchievementArea` on the `subArea` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `subArea` DROP COLUMN `isAchievementArea`,
    ADD COLUMN `explorationAchievementId` INTEGER NULL;
