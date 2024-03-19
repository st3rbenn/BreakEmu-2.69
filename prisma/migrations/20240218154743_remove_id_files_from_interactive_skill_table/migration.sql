/*
  Warnings:

  - The primary key for the `interactiveSkill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `interactiveSkill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `interactiveSkill` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`identifier`);
