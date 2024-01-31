-- CreateTable
CREATE TABLE `interactiveSkill` (
    `id` INTEGER NOT NULL,
    `mapId` INTEGER NOT NULL,
    `identifier` INTEGER NOT NULL,
    `actionIdentifier` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `skillId` VARCHAR(191) NOT NULL,
    `param1` VARCHAR(191) NOT NULL,
    `param2` VARCHAR(191) NOT NULL,
    `param3` VARCHAR(191) NOT NULL,
    `criteria` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
