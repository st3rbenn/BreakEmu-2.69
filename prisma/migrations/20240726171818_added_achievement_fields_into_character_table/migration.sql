-- AlterTable
ALTER TABLE `character` ADD COLUMN `almostFinishedAchievements` JSON NULL,
    ADD COLUMN `finishedAchievementObjectives` JSON NULL,
    ADD COLUMN `finishedAchievements` JSON NULL,
    ADD COLUMN `untakenAchievementsReward` JSON NULL;
