-- CreateTable
CREATE TABLE `breed` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `maleLook` VARCHAR(191) NOT NULL,
    `femaleLook` VARCHAR(191) NOT NULL,
    `maleColors` VARCHAR(191) NOT NULL,
    `femaleColors` VARCHAR(191) NOT NULL,
    `spForIntelligence` VARCHAR(191) NOT NULL,
    `spForAgility` VARCHAR(191) NOT NULL,
    `spForStrength` VARCHAR(191) NOT NULL,
    `spForVitality` VARCHAR(191) NOT NULL,
    `spforWisdom` VARCHAR(191) NOT NULL,
    `spForChance` VARCHAR(191) NOT NULL,
    `startLifePoints` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
