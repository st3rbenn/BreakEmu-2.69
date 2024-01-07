/*
  Warnings:

  - A unique constraint covering the columns `[level]` on the table `experience` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[experience]` on the table `experience` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `character` ADD COLUMN `experience` BIGINT NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX `experience_level_key` ON `experience`(`level`);

-- CreateIndex
CREATE UNIQUE INDEX `experience_experience_key` ON `experience`(`experience`);
