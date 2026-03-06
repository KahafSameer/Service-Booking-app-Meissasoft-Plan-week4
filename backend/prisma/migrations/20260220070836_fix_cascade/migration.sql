-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `timeslot` DROP FOREIGN KEY `TimeSlot_serviceId_fkey`;

-- DropIndex
DROP INDEX `Booking_serviceId_fkey` ON `booking`;

-- DropIndex
DROP INDEX `TimeSlot_serviceId_fkey` ON `timeslot`;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TimeSlot` ADD CONSTRAINT `TimeSlot_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
