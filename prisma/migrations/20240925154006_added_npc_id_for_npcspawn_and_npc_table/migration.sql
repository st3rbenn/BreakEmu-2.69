/*
  Warnings:

  - Added the required column `npcId` to the `npc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `npc` ADD COLUMN `npcId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `npcspawn` MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT;

-- CreateTable
CREATE TABLE `npcreply` (
    `id` INTEGER NOT NULL,
    `npcId` INTEGER NOT NULL,
    `replyId` INTEGER NOT NULL,
    `messageId` INTEGER NOT NULL,
    `action` INTEGER NOT NULL,
    `param1` VARCHAR(191) NOT NULL,
    `param2` VARCHAR(191) NOT NULL,
    `param3` VARCHAR(191) NOT NULL,
    `criteria` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `npcreply` ADD CONSTRAINT `npcreply_npcId_fkey` FOREIGN KEY (`npcId`) REFERENCES `npc`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
