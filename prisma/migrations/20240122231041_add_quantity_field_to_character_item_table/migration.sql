/*
  Warnings:

  - Added the required column `quantity` to the `characterItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `characterItem` ADD COLUMN `quantity` INTEGER NOT NULL;
