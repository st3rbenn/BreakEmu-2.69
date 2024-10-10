/*
  Warnings:

  - You are about to drop the column `npcId` on the `npc` table. All the data in the column will be lost.
  - Added the required column `npcTemplate` to the `npc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `npc` DROP COLUMN `npcId`,
    ADD COLUMN `npcTemplate` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `npctemplate` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `look` VARCHAR(191) NOT NULL,
    `gender` INTEGER NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `dialogMessages` JSON NOT NULL,
    `dialogReplies` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
