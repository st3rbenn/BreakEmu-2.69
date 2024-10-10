/*
  Warnings:

  - Added the required column `npcspawnId` to the `npc` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `npcspawn` DROP FOREIGN KEY `npcspawn_npcId_fkey`;

-- AlterTable
ALTER TABLE `npc` ADD COLUMN `npcspawnId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `npc` ADD CONSTRAINT `npc_npcspawnId_fkey` FOREIGN KEY (`npcspawnId`) REFERENCES `npcspawn`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
