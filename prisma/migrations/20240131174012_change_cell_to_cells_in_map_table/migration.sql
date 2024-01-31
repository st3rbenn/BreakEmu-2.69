/*
  Warnings:

  - You are about to drop the column `cell` on the `map` table. All the data in the column will be lost.
  - Added the required column `cells` to the `map` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `map` DROP COLUMN `cell`,
    ADD COLUMN `cells` JSON NOT NULL;
