/*
  Warnings:

  - The primary key for the `characterItem` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `characterItem` DROP PRIMARY KEY,
    MODIFY `uid` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`uid`);

-- CreateTable
CREATE TABLE `characterItemIdMapper` (
    `intId` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `characterItemIdMapper_uuid_key`(`uuid`),
    INDEX `idx_uuid`(`uuid`),
    PRIMARY KEY (`intId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `characterItemIdMapper` ADD CONSTRAINT `characterItemIdMapper_uuid_fkey` FOREIGN KEY (`uuid`) REFERENCES `characterItem`(`uid`) ON DELETE RESTRICT ON UPDATE CASCADE;
