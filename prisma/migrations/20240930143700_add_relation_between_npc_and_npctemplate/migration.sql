/*
  Warnings:

  - You are about to drop the column `npctemplate` on the `npc` table. All the data in the column will be lost.
  - Added the required column `npcTemplateId` to the `npc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `npc` DROP COLUMN `npctemplate`,
    ADD COLUMN `npcTemplateId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `npc` ADD CONSTRAINT `npc_npcTemplateId_fkey` FOREIGN KEY (`npcTemplateId`) REFERENCES `npctemplate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
