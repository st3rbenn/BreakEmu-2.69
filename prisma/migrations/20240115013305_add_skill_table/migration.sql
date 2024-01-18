-- CreateTable
CREATE TABLE `skill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `parentJobId` INTEGER NOT NULL,
    `gatheredRessourceItem` INTEGER NOT NULL,
    `interactiveId` INTEGER NOT NULL,
    `levelMin` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
