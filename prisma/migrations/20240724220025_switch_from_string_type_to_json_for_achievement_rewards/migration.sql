/*
  Warnings:

  - You are about to alter the column `itemsReward` on the `achievementReward` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `itemsQuantityReward` on the `achievementReward` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `emotesReward` on the `achievementReward` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `spellsReward` on the `achievementReward` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `titlesReward` on the `achievementReward` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `ornamentsReward` on the `achievementReward` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `achievementReward` MODIFY `itemsReward` JSON NOT NULL,
    MODIFY `itemsQuantityReward` JSON NOT NULL,
    MODIFY `emotesReward` JSON NOT NULL,
    MODIFY `spellsReward` JSON NOT NULL,
    MODIFY `titlesReward` JSON NOT NULL,
    MODIFY `ornamentsReward` JSON NOT NULL;
