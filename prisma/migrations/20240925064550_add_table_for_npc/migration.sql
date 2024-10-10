-- CreateTable
CREATE TABLE `npc` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `look` VARCHAR(191) NOT NULL,
    `gender` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npcaction` (
    `id` INTEGER NOT NULL,
    `npcId` INTEGER NOT NULL,
    `action` INTEGER NOT NULL,
    `param1` VARCHAR(191) NOT NULL,
    `param2` VARCHAR(191) NOT NULL,
    `param3` VARCHAR(191) NOT NULL,
    `criteria` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `npcspawn` (
    `id` INTEGER NOT NULL,
    `npcId` INTEGER NOT NULL,
    `mapId` INTEGER NOT NULL,
    `cellId` INTEGER NOT NULL,
    `direction` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `npcaction` ADD CONSTRAINT `npcaction_npcId_fkey` FOREIGN KEY (`npcId`) REFERENCES `npc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `npcspawn` ADD CONSTRAINT `npcspawn_npcId_fkey` FOREIGN KEY (`npcId`) REFERENCES `npc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
