-- AddForeignKey
ALTER TABLE `character` ADD CONSTRAINT `character_breed_id_fkey` FOREIGN KEY (`breed_id`) REFERENCES `breed`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
