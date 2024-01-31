-- CreateTable
CREATE TABLE `subArea` (
    `id` INTEGER NOT NULL,
    `name` TEXT NOT NULL,
    `areaId` INTEGER NOT NULL,
    `level` INTEGER NOT NULL,
    `monsterIds` JSON NOT NULL,
    `questsIds` JSON NOT NULL,
    `npcIds` JSON NOT NULL,
    `associatedZaapsMapId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
