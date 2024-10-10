-- DropForeignKey
ALTER TABLE `npcaction` DROP FOREIGN KEY `npcaction_npcId_fkey`;

-- DropForeignKey
ALTER TABLE `npcreply` DROP FOREIGN KEY `npcreply_npcId_fkey`;

-- AddForeignKey
ALTER TABLE `npcaction` ADD CONSTRAINT `npcaction_npcId_fkey` FOREIGN KEY (`npcId`) REFERENCES `npc`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `npcreply` ADD CONSTRAINT `npcreply_npcId_fkey` FOREIGN KEY (`npcId`) REFERENCES `npc`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
