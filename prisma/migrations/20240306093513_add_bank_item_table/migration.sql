-- CreateTable
CREATE TABLE `bankItem` (
    `accountId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,
    `gId` INTEGER NOT NULL,
    `position` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `effects` JSON NOT NULL,
    `appearanceId` INTEGER NOT NULL,
    `look` TEXT NULL,

    PRIMARY KEY (`accountId`, `itemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
