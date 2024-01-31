-- CreateTable
CREATE TABLE `characterItem` (
    `characterId` INTEGER NOT NULL,
    `uid` INTEGER NOT NULL,
    `gid` INTEGER NOT NULL,
    `position` INTEGER NOT NULL,
    `effects` JSON NOT NULL,
    `appearanceId` INTEGER NOT NULL,
    `look` TEXT NULL,

    PRIMARY KEY (`characterId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `characterItem` ADD CONSTRAINT `characterItem_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
