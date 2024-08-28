-- AddForeignKey
ALTER TABLE `characterItem` ADD CONSTRAINT `characterItem_gid_fkey` FOREIGN KEY (`gid`) REFERENCES `item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
