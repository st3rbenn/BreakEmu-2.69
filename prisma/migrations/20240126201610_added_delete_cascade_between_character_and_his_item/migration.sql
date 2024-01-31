-- DropForeignKey
ALTER TABLE `characterItem` DROP FOREIGN KEY `characterItem_characterId_fkey`;

-- AddForeignKey
ALTER TABLE `characterItem` ADD CONSTRAINT `characterItem_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
