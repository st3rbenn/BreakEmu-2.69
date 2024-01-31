/*
  Warnings:

  - You are about to drop the column `lvel` on the `item` table. All the data in the column will be lost.
  - Added the required column `level` to the `item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bonusIsSecret` to the `itemSet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `item` DROP COLUMN `lvel`,
    ADD COLUMN `level` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `itemSet` ADD COLUMN `bonusIsSecret` BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE `weapon` (
    `id` INTEGER NOT NULL,
    `name` TEXT NOT NULL,
    `typeId` INTEGER NOT NULL,
    `level` INTEGER NOT NULL,
    `realWeight` INTEGER NOT NULL,
    `cursed` BOOLEAN NOT NULL,
    `usable` BOOLEAN NOT NULL,
    `exchangeable` BOOLEAN NOT NULL,
    `price` INTEGER NOT NULL,
    `etheral` BOOLEAN NOT NULL,
    `itemSetId` INTEGER NOT NULL,
    `criteria` VARCHAR(191) NOT NULL,
    `appearanceId` INTEGER NOT NULL,
    `dropMonsterIds` JSON NOT NULL,
    `recipeSlots` INTEGER NOT NULL,
    `recipeIds` JSON NOT NULL,
    `effects` JSON NOT NULL,
    `craftXpRatio` INTEGER NOT NULL,
    `isSaleable` BOOLEAN NOT NULL,
    `apCost` INTEGER NOT NULL,
    `minRange` INTEGER NOT NULL,
    `maxRange` INTEGER NOT NULL,
    `maxCastPerTurn` INTEGER NOT NULL,
    `castInLine` BOOLEAN NOT NULL,
    `castInDiag` BOOLEAN NOT NULL,
    `castTestLos` BOOLEAN NOT NULL,
    `criticalHitProb` INTEGER NOT NULL,
    `criticalHitBonus` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `weapon` ADD CONSTRAINT `weapon_itemSetId_fkey` FOREIGN KEY (`itemSetId`) REFERENCES `itemSet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
