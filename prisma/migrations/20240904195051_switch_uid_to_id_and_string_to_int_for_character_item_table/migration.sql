/*
  Warnings:

  - The primary key for the `characterItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uid` on the `characterItem` table. All the data in the column will be lost.
  - Added the required column `id` to the `characterItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `characterItem` DROP PRIMARY KEY,
    DROP COLUMN `uid`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);
