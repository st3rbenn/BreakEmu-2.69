/*
  Warnings:

  - You are about to drop the column `AP` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `MP` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `aggressable` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `agility` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `alignementGrade` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `alignementSide` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `alignementValue` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `chance` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `characterPower` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `dishonor` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `energy` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `honor` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `intelligence` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `prospection` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `strength` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `vitality` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `wisdom` on the `character` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `character` DROP COLUMN `AP`,
    DROP COLUMN `MP`,
    DROP COLUMN `aggressable`,
    DROP COLUMN `agility`,
    DROP COLUMN `alignementGrade`,
    DROP COLUMN `alignementSide`,
    DROP COLUMN `alignementValue`,
    DROP COLUMN `chance`,
    DROP COLUMN `characterPower`,
    DROP COLUMN `dishonor`,
    DROP COLUMN `energy`,
    DROP COLUMN `honor`,
    DROP COLUMN `intelligence`,
    DROP COLUMN `prospection`,
    DROP COLUMN `strength`,
    DROP COLUMN `vitality`,
    DROP COLUMN `wisdom`,
    ADD COLUMN `stats` JSON NULL,
    ADD COLUMN `statsPoints` INTEGER NOT NULL DEFAULT 0,
    MODIFY `cellId` VARCHAR(191) NULL,
    MODIFY `mapId` VARCHAR(191) NULL;
