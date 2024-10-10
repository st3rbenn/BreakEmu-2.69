/*
  Warnings:

  - You are about to drop the column `npcspawnId` on the `npc` table. All the data in the column will be lost.
  - You are about to drop the column `npcId` on the `npcspawn` table. All the data in the column will be lost.
  - Added the required column `npc` to the `npcspawn` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `npc` DROP FOREIGN KEY `npc_npcspawnId_fkey`;

-- AlterTable
ALTER TABLE `npc` DROP COLUMN `npcspawnId`;

-- AlterTable
ALTER TABLE `npcspawn` DROP COLUMN `npcId`,
    ADD COLUMN `npc` INTEGER NOT NULL;
