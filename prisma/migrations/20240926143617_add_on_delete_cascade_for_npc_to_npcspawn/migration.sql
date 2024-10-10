-- DropForeignKey
ALTER TABLE `npc` DROP FOREIGN KEY `npc_npcspawnId_fkey`;

-- DropIndex
DROP INDEX `npcspawn_npcId_fkey` ON `npcspawn`;

-- AddForeignKey
ALTER TABLE `npc` ADD CONSTRAINT `npc_npcspawnId_fkey` FOREIGN KEY (`npcspawnId`) REFERENCES `npcspawn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
