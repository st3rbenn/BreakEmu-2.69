-- CreateTable
CREATE TABLE `recipe` (
    `id` INTEGER NOT NULL,
    `resultId` INTEGER NOT NULL,
    `resultName` VARCHAR(191) NOT NULL,
    `resultType` INTEGER NOT NULL,
    `resultLevel` INTEGER NOT NULL,
    `ingredients` JSON NOT NULL,
    `quantities` JSON NOT NULL,
    `jobId` INTEGER NOT NULL,
    `skillId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
