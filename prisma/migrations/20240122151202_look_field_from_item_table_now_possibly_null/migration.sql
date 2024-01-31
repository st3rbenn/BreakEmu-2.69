-- DropIndex
DROP INDEX `item_itemSetId_fkey` ON `item`;

-- DropIndex
DROP INDEX `weapon_itemSetId_fkey` ON `weapon`;

-- AlterTable
ALTER TABLE `item` MODIFY `look` TEXT NULL;
