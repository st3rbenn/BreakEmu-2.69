-- CreateTable
CREATE TABLE `mapScrollAction` (
    `id` INTEGER NOT NULL,
    `rightMapId` INTEGER NOT NULL,
    `leftMapId` INTEGER NOT NULL,
    `topMapId` INTEGER NOT NULL,
    `bottomMapId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
