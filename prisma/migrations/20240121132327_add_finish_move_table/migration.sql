-- CreateTable
CREATE TABLE `finishMove` (
    `id` INTEGER NOT NULL,
    `duration` INTEGER NOT NULL,
    `free` BOOLEAN NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `spellLevel` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
