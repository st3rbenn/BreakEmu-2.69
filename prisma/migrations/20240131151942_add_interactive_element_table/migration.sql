-- CreateTable
CREATE TABLE `interactiveElement` (
    `id` INTEGER NOT NULL,
    `elementId` INTEGER NOT NULL,
    `mapId` INTEGER NOT NULL,
    `cellId` INTEGER NOT NULL,
    `elementType` INTEGER NOT NULL,
    `gfxId` INTEGER NOT NULL,
    `bonesId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
