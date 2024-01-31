-- CreateTable
CREATE TABLE `item` (
    `id` INTEGER NOT NULL,
    `name` TEXT NOT NULL,
    `typeId` INTEGER NOT NULL,
    `lvel` INTEGER NOT NULL,
    `realWeight` INTEGER NOT NULL,
    `cursed` BOOLEAN NOT NULL,
    `usable` BOOLEAN NOT NULL,
    `exchangeable` BOOLEAN NOT NULL,
    `price` INTEGER NOT NULL,
    `etheral` BOOLEAN NOT NULL,
    `itemSetId` INTEGER NOT NULL,
    `criteria` VARCHAR(191) NOT NULL,
    `appearanceId` INTEGER NOT NULL,
    `dropMonsterIds` JSON NOT NULL,
    `recipeSlots` INTEGER NOT NULL,
    `recipeIds` JSON NOT NULL,
    `effects` JSON NOT NULL,
    `craftXpRatio` INTEGER NOT NULL,
    `isSaleable` BOOLEAN NOT NULL,
    `look` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itemSet` (
    `id` INTEGER NOT NULL,
    `name` TEXT NOT NULL,
    `items` JSON NOT NULL,
    `effect` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `item` ADD CONSTRAINT `item_itemSetId_fkey` FOREIGN KEY (`itemSetId`) REFERENCES `itemSet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
