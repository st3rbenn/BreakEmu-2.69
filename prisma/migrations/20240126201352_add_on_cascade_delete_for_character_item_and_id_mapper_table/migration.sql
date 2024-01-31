-- DropForeignKey
ALTER TABLE `characterItemIdMapper` DROP FOREIGN KEY `characterItemIdMapper_uuid_fkey`;

-- AddForeignKey
ALTER TABLE `characterItemIdMapper` ADD CONSTRAINT `characterItemIdMapper_uuid_fkey` FOREIGN KEY (`uuid`) REFERENCES `characterItem`(`uid`) ON DELETE CASCADE ON UPDATE CASCADE;
