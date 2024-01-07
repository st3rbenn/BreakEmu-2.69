/*
  Warnings:

  - You are about to drop the column `alignmentGrade` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `alignmentSide` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `alignmentValue` on the `character` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `character` DROP COLUMN `alignmentGrade`,
    DROP COLUMN `alignmentSide`,
    DROP COLUMN `alignmentValue`,
    ADD COLUMN `alignementGrade` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `alignementSide` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `alignementValue` INTEGER NOT NULL DEFAULT 0;
