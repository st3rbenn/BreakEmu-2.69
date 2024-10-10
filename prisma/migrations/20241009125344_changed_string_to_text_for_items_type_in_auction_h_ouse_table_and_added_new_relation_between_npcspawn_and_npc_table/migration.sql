-- AlterTable
ALTER TABLE `auctionHouse` MODIFY `itemsType` TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE `npcspawn` ADD CONSTRAINT `npcspawn_npc_fkey` FOREIGN KEY (`npc`) REFERENCES `npc`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
