/*
  Warnings:

  - The primary key for the `characterItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `character` on the `characterItem` table. All the data in the column will be lost.
  - Added the required column `characterId` to the `characterItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `characterItem` DROP FOREIGN KEY `characterItem_character_fkey`;

-- AlterTable
ALTER TABLE `characterItem` DROP PRIMARY KEY,
    DROP COLUMN `character`,
    ADD COLUMN `characterId` INTEGER NOT NULL,
    MODIFY `uid` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`uid`);

-- AddForeignKey
ALTER TABLE `characterItem` ADD CONSTRAINT `characterItem_characterId_fkey` FOREIGN KEY (`characterId`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
