-- AddForeignKey
ALTER TABLE `bankItem` ADD CONSTRAINT `bankItem_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bankItem` ADD CONSTRAINT `bankItem_gId_fkey` FOREIGN KEY (`gId`) REFERENCES `item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
