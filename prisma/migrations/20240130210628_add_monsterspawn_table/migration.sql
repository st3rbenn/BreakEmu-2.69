-- CreateTable
CREATE TABLE `monsterSpawn` (
    `id` INTEGER NOT NULL,
    `monsterId` INTEGER NOT NULL,
    `subAreaId` INTEGER NOT NULL,
    `probability` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
