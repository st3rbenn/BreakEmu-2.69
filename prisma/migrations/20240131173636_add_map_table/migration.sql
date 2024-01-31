-- CreateTable
CREATE TABLE `map` (
    `id` INTEGER NOT NULL,
    `subAreaId` INTEGER NOT NULL,
    `version` INTEGER NOT NULL,
    `leftNeighbourId` INTEGER NOT NULL,
    `rightNeighbourId` INTEGER NOT NULL,
    `topNeighbourId` INTEGER NOT NULL,
    `bottomNeighbourId` INTEGER NOT NULL,
    `cell` JSON NOT NULL,
    `elements` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
