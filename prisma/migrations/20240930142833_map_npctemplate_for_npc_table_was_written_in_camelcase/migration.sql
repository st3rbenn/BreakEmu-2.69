/*
  Warnings:

  - You are about to drop the column `npcTemplate` on the `npc` table. All the data in the column will be lost.
  - Added the required column `npctemplate` to the `npc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `npc` DROP COLUMN `npcTemplate`,
    ADD COLUMN `npctemplate` INTEGER NOT NULL;
