-- CreateTable
CREATE TABLE `head` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `skins` VARCHAR(191) NOT NULL,
    `assetId` VARCHAR(191) NOT NULL,
    `breed` INTEGER NOT NULL,
    `gender` BOOLEAN NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `head` ADD CONSTRAINT `head_breed_fkey` FOREIGN KEY (`breed`) REFERENCES `breed`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
