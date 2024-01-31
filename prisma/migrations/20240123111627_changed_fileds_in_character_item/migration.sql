/*
  Warnings:

  - The primary key for the `characterItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `characterId` on the `characterItem` table. All the data in the column will be lost.
  - Added the required column `character` to the `characterItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `characterItem` DROP FOREIGN KEY `characterItem_characterId_fkey`;

-- AlterTable
ALTER TABLE `characterItem` DROP PRIMARY KEY,
    DROP COLUMN `characterId`,
    ADD COLUMN `character` INTEGER NOT NULL,
    ADD PRIMARY KEY (`character`);

-- AddForeignKey
ALTER TABLE `characterItem` ADD CONSTRAINT `characterItem_character_fkey` FOREIGN KEY (`character`) REFERENCES `character`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
