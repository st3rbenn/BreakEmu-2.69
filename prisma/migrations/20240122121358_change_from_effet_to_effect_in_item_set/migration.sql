/*
  Warnings:

  - You are about to drop the column `effect` on the `itemSet` table. All the data in the column will be lost.
  - Added the required column `effects` to the `itemSet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `itemSet` DROP COLUMN `effect`,
    ADD COLUMN `effects` JSON NOT NULL;
