/*
  Warnings:

  - You are about to drop the column `npcId` on the `npcaction` table. All the data in the column will be lost.
  - You are about to drop the column `npcId` on the `npcreply` table. All the data in the column will be lost.
  - Added the required column `npcspawnId` to the `npc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `npc` to the `npcaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `npc` to the `npcreply` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `npcaction` DROP FOREIGN KEY `npcaction_npcId_fkey`;

-- DropForeignKey
ALTER TABLE `npcreply` DROP FOREIGN KEY `npcreply_npcId_fkey`;

-- AlterTable
ALTER TABLE `npc` ADD COLUMN `npcspawnId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `npcaction` DROP COLUMN `npcId`,
    ADD COLUMN `npc` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `npcreply` DROP COLUMN `npcId`,
    ADD COLUMN `npc` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `npc` ADD CONSTRAINT `npc_npcspawnId_fkey` FOREIGN KEY (`npcspawnId`) REFERENCES `npcspawn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `npcaction` ADD CONSTRAINT `npcaction_npc_fkey` FOREIGN KEY (`npc`) REFERENCES `npc`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `npcreply` ADD CONSTRAINT `npcreply_npc_fkey` FOREIGN KEY (`npc`) REFERENCES `npc`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
