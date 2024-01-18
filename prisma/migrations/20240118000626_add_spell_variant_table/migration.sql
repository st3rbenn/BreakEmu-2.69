-- CreateTable
CREATE TABLE `spellVariant` (
    `id` INTEGER NOT NULL,
    `breedId` INTEGER NOT NULL,
    `spellIds` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
