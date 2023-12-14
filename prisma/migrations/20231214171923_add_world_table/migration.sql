-- CreateTable
CREATE TABLE `worlds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `port` INTEGER NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `requireSubscription` BOOLEAN NOT NULL DEFAULT false,
    `completion` INTEGER NOT NULL,
    `serverSelectable` BOOLEAN NOT NULL DEFAULT false,
    `charCapacity` INTEGER NOT NULL,
    `charsCount` INTEGER NOT NULL,
    `requiredRole` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
