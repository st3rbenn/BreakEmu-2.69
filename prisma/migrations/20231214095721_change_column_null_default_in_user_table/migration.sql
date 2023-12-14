-- AlterTable
ALTER TABLE `user` MODIFY `pseudo` VARCHAR(191) NULL,
    MODIFY `tag` VARCHAR(191) NULL,
    MODIFY `login_at` DATETIME(3) NULL,
    MODIFY `logout_at` DATETIME(3) NULL,
    MODIFY `updated_at` DATETIME(3) NULL;
