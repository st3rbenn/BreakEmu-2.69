-- CreateTable
CREATE TABLE `dungeon` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `optimalPlayerLevel` INTEGER NOT NULL,
    `mapId` VARCHAR(191) NOT NULL,
    `entranceMapId` BIGINT NOT NULL,
    `exitMapId` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
