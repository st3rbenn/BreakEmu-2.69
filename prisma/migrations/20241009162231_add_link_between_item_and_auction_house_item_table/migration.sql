-- AddForeignKey
ALTER TABLE `auctionHouseItem` ADD CONSTRAINT `auctionHouseItem_gId_fkey` FOREIGN KEY (`gId`) REFERENCES `item`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
