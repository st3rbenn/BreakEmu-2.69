/*
  Warnings:

  - You are about to drop the column `created_at` on the `experience` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `experience` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `experience` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `experience` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[characterExperience]` on the table `experience` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jobExperience]` on the table `experience` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[guildExperience]` on the table `experience` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mountExperience]` on the table `experience` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `characterExperience` to the `experience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guildExperience` to the `experience` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobExperience` to the `experience` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `experience_experience_key` ON `experience`;

-- AlterTable
ALTER TABLE `experience` DROP COLUMN `created_at`,
    DROP COLUMN `deleted_at`,
    DROP COLUMN `experience`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `characterExperience` BIGINT NOT NULL,
    ADD COLUMN `guildExperience` BIGINT NOT NULL,
    ADD COLUMN `jobExperience` BIGINT NOT NULL,
    ADD COLUMN `mountExperience` BIGINT NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX `experience_characterExperience_key` ON `experience`(`characterExperience`);

-- CreateIndex
CREATE UNIQUE INDEX `experience_jobExperience_key` ON `experience`(`jobExperience`);

-- CreateIndex
CREATE UNIQUE INDEX `experience_guildExperience_key` ON `experience`(`guildExperience`);

-- CreateIndex
CREATE UNIQUE INDEX `experience_mountExperience_key` ON `experience`(`mountExperience`);
