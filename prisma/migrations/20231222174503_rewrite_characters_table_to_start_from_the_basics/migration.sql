/*
  Warnings:

  - You are about to drop the column `experience` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `face_id` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `character` table. All the data in the column will be lost.
  - You are about to drop the column `sex_id` on the `character` table. All the data in the column will be lost.
  - Added the required column `cosmeticId` to the `character` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sex` to the `character` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `character` DROP COLUMN `experience`,
    DROP COLUMN `face_id`,
    DROP COLUMN `images`,
    DROP COLUMN `level`,
    DROP COLUMN `sex_id`,
    ADD COLUMN `cosmeticId` INTEGER NOT NULL,
    ADD COLUMN `sex` BOOLEAN NOT NULL;
