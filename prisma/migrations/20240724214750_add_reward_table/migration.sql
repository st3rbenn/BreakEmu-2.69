-- CreateTable
CREATE TABLE `achievement` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL,
    `level` INTEGER NOT NULL,
    `order` INTEGER NOT NULL,
    `accountLinked` BOOLEAN NOT NULL,
    `objectiveIds` JSON NOT NULL,
    `rewardIds` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `achievementObjective` (
    `id` INTEGER NOT NULL,
    `achievementId` INTEGER NOT NULL,
    `order` INTEGER NOT NULL,
    `criterion` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `achievementReward` (
    `id` INTEGER NOT NULL,
    `achievementId` INTEGER NOT NULL,
    `criteria` VARCHAR(191) NOT NULL,
    `kamasRatio` INTEGER NOT NULL,
    `experienceRatio` INTEGER NOT NULL,
    `kamasScaleWithPlayerLevel` BOOLEAN NOT NULL,
    `itemsReward` VARCHAR(191) NOT NULL,
    `itemsQuantityReward` VARCHAR(191) NOT NULL,
    `emotesReward` VARCHAR(191) NOT NULL,
    `spellsReward` VARCHAR(191) NOT NULL,
    `titlesReward` VARCHAR(191) NOT NULL,
    `ornamentsReward` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
