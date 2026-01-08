-- ============================================
-- TravelGo Database - MySQL Complete File
-- Từ A-Z: Schema + Dữ liệu đầy đủ cho toàn bộ website
-- ============================================
-- ============================================
-- PHẦN 1: TẠO DATABASE
-- ============================================
CREATE DATABASE IF NOT EXISTS travelgo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE travelgo;

-- ============================================
-- PHẦN 2: XÓA CÁC BẢNG CŨ (NẾU CÓ)
-- ============================================
SET
    FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `ChatMessage`;

DROP TABLE IF EXISTS `ChatSession`;

DROP TABLE IF EXISTS `NewsletterSubscription`;

DROP TABLE IF EXISTS `TourReview`;

DROP TABLE IF EXISTS `PaymentTour`;

DROP TABLE IF EXISTS `BookingTour`;

DROP TABLE IF EXISTS `Tour`;

DROP TABLE IF EXISTS `Restaurant`;

DROP TABLE IF EXISTS `Hotel`;

DROP TABLE IF EXISTS `SupportTicket`;

DROP TABLE IF EXISTS `Category`;

DROP TABLE IF EXISTS `Loyalty`;

DROP TABLE IF EXISTS `Wishlist`;

DROP TABLE IF EXISTS `Notification`;

DROP TABLE IF EXISTS `Review`;

DROP TABLE IF EXISTS `Payment`;

DROP TABLE IF EXISTS `Booking`;

DROP TABLE IF EXISTS `Destination`;

DROP TABLE IF EXISTS `User`;

DROP TABLE IF EXISTS `_prisma_migrations`;

SET
    FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- PHẦN 3: TẠO CẤU TRÚC BẢNG (SCHEMA)
-- ============================================
-- Bảng User
CREATE TABLE
    `User` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `email` VARCHAR(191) NOT NULL,
        `passwordHash` VARCHAR(191) NOT NULL,
        `name` VARCHAR(191) NOT NULL,
        `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
        `avatarUrl` VARCHAR(191) NULL,
        `settings` JSON NULL,
        `resetToken` VARCHAR(191) NULL,
        `resetTokenExpiry` DATETIME(3) NULL,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        UNIQUE KEY `User_email_key` (`email`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng Category
CREATE TABLE
    `Category` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `name` VARCHAR(191) NOT NULL,
        PRIMARY KEY (`id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng Destination
CREATE TABLE
    `Destination` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `name` VARCHAR(191) NOT NULL,
        `slug` VARCHAR(191) NOT NULL,
        `description` TEXT NULL,
        `image` VARCHAR(191) NULL,
        `country` VARCHAR(191) NULL DEFAULT 'Việt Nam',
        `featured` BOOLEAN NOT NULL DEFAULT false,
        `price` INT NOT NULL DEFAULT 0,
        `categoryId` INT NULL,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        UNIQUE KEY `Destination_slug_key` (`slug`),
        KEY `Destination_categoryId_fkey` (`categoryId`),
        CONSTRAINT `Destination_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng Booking
CREATE TABLE
    `Booking` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `code` VARCHAR(191) NOT NULL,
        `userId` INT NOT NULL,
        `destinationId` INT NOT NULL,
        `status` ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
        `totalAmount` INT NOT NULL,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        UNIQUE KEY `Booking_code_key` (`code`),
        KEY `Booking_userId_fkey` (`userId`),
        KEY `Booking_destinationId_fkey` (`destinationId`),
        CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT `Booking_destinationId_fkey` FOREIGN KEY (`destinationId`) REFERENCES `Destination` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng Payment
CREATE TABLE
    `Payment` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `bookingId` INT NOT NULL,
        `amount` INT NOT NULL,
        `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
        `provider` VARCHAR(191) NOT NULL,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        UNIQUE KEY `Payment_bookingId_key` (`bookingId`),
        CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng Review
CREATE TABLE
    `Review` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `userId` INT NOT NULL,
        `destinationId` INT NOT NULL,
        `rating` INT NOT NULL,
        `comment` TEXT NULL,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        KEY `Review_userId_fkey` (`userId`),
        KEY `Review_destinationId_fkey` (`destinationId`),
        CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT `Review_destinationId_fkey` FOREIGN KEY (`destinationId`) REFERENCES `Destination` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng Notification
CREATE TABLE
    `Notification` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `userId` INT NOT NULL,
        `type` VARCHAR(191) NOT NULL,
        `message` VARCHAR(191) NOT NULL,
        `read` BOOLEAN NOT NULL DEFAULT false,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        KEY `Notification_userId_fkey` (`userId`),
        CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng Wishlist
CREATE TABLE
    `Wishlist` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `userId` INT NOT NULL,
        `destinationId` INT NOT NULL,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        UNIQUE KEY `Wishlist_userId_destinationId_key` (`userId`, `destinationId`),
        KEY `Wishlist_destinationId_fkey` (`destinationId`),
        CONSTRAINT `Wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT `Wishlist_destinationId_fkey` FOREIGN KEY (`destinationId`) REFERENCES `Destination` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng Loyalty
CREATE TABLE
    `Loyalty` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `userId` INT NOT NULL,
        `points` INT NOT NULL DEFAULT 0,
        `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        UNIQUE KEY `Loyalty_userId_key` (`userId`),
        CONSTRAINT `Loyalty_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng SupportTicket
CREATE TABLE
    `SupportTicket` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `userEmail` VARCHAR(191) NOT NULL,
        `subject` VARCHAR(191) NOT NULL,
        `message` TEXT NOT NULL,
        `status` VARCHAR(191) NOT NULL DEFAULT 'open',
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng Hotel
CREATE TABLE
    `Hotel` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `name` VARCHAR(191) NOT NULL,
        `slug` VARCHAR(191) NOT NULL,
        `description` TEXT NULL,
        `image` VARCHAR(191) NULL,
        `address` VARCHAR(191) NULL,
        `city` VARCHAR(191) NULL,
        `country` VARCHAR(191) NULL DEFAULT 'Việt Nam',
        `pricePerNight` INT NOT NULL DEFAULT 0,
        `rating` DOUBLE NOT NULL DEFAULT 0,
        `featured` BOOLEAN NOT NULL DEFAULT false,
        `amenities` JSON NULL,
        `contact` VARCHAR(191) NULL,
        `website` VARCHAR(191) NULL,
        `destinationId` INT NULL,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        UNIQUE KEY `Hotel_slug_key` (`slug`),
        KEY `Hotel_destinationId_fkey` (`destinationId`),
        CONSTRAINT `Hotel_destinationId_fkey` FOREIGN KEY (`destinationId`) REFERENCES `Destination` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng Restaurant
CREATE TABLE
    `Restaurant` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `name` VARCHAR(191) NOT NULL,
        `slug` VARCHAR(191) NOT NULL,
        `description` TEXT NULL,
        `image` VARCHAR(191) NULL,
        `address` VARCHAR(191) NULL,
        `city` VARCHAR(191) NULL,
        `country` VARCHAR(191) NULL DEFAULT 'Việt Nam',
        `cuisine` VARCHAR(191) NULL,
        `priceRange` VARCHAR(191) NULL,
        `rating` DOUBLE NOT NULL DEFAULT 0,
        `featured` BOOLEAN NOT NULL DEFAULT false,
        `amenities` JSON NULL,
        `contact` VARCHAR(191) NULL,
        `website` VARCHAR(191) NULL,
        `openingHours` JSON NULL,
        `destinationId` INT NULL,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        UNIQUE KEY `Restaurant_slug_key` (`slug`),
        KEY `Restaurant_destinationId_fkey` (`destinationId`),
        CONSTRAINT `Restaurant_destinationId_fkey` FOREIGN KEY (`destinationId`) REFERENCES `Destination` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng Tour
CREATE TABLE
    `Tour` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `name` VARCHAR(191) NOT NULL,
        `slug` VARCHAR(191) NOT NULL,
        `description` TEXT NULL,
        `shortDescription` VARCHAR(191) NULL,
        `image` VARCHAR(191) NULL,
        `photos` JSON NULL,
        `duration` INT NOT NULL DEFAULT 1,
        `price` INT NOT NULL DEFAULT 0,
        `originalPrice` INT NULL,
        `rating` DOUBLE NOT NULL DEFAULT 0,
        `reviewCount` INT NOT NULL DEFAULT 0,
        `tags` JSON NULL,
        `featured` BOOLEAN NOT NULL DEFAULT false,
        `highlights` JSON NULL,
        `itinerary` JSON NULL,
        `map` VARCHAR(191) NULL,
        `faq` JSON NULL,
        `policies` JSON NULL,
        `transport` VARCHAR(191) NULL,
        `destinationId` INT NULL,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        UNIQUE KEY `Tour_slug_key` (`slug`),
        KEY `Tour_destinationId_fkey` (`destinationId`),
        CONSTRAINT `Tour_destinationId_fkey` FOREIGN KEY (`destinationId`) REFERENCES `Destination` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng BookingTour
CREATE TABLE
    `BookingTour` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `tourId` INT NOT NULL,
        `userId` INT NOT NULL,
        `code` VARCHAR(191) NOT NULL,
        `status` ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
        `totalAmount` INT NOT NULL,
        `participants` INT NOT NULL DEFAULT 1,
        `date` DATETIME(3) NOT NULL,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        UNIQUE KEY `BookingTour_code_key` (`code`),
        KEY `BookingTour_tourId_fkey` (`tourId`),
        KEY `BookingTour_userId_fkey` (`userId`),
        CONSTRAINT `BookingTour_tourId_fkey` FOREIGN KEY (`tourId`) REFERENCES `Tour` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT `BookingTour_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng PaymentTour
CREATE TABLE
    `PaymentTour` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `bookingId` INT NOT NULL,
        `amount` INT NOT NULL,
        `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
        `provider` VARCHAR(191) NOT NULL,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        UNIQUE KEY `PaymentTour_bookingId_key` (`bookingId`),
        CONSTRAINT `PaymentTour_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `BookingTour` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng TourReview
CREATE TABLE
    `TourReview` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `tourId` INT NOT NULL,
        `userId` INT NOT NULL,
        `rating` INT NOT NULL,
        `comment` TEXT NULL,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        KEY `TourReview_tourId_fkey` (`tourId`),
        KEY `TourReview_userId_fkey` (`userId`),
        CONSTRAINT `TourReview_tourId_fkey` FOREIGN KEY (`tourId`) REFERENCES `Tour` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT `TourReview_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng NewsletterSubscription
CREATE TABLE
    `NewsletterSubscription` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `email` VARCHAR(191) NOT NULL,
        `subscribed` BOOLEAN NOT NULL DEFAULT true,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        UNIQUE KEY `NewsletterSubscription_email_key` (`email`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng ChatSession
CREATE TABLE
    `ChatSession` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `userId` INT NULL,
        `sessionId` VARCHAR(191) NOT NULL,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        UNIQUE KEY `ChatSession_sessionId_key` (`sessionId`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Bảng ChatMessage
CREATE TABLE
    `ChatMessage` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `sessionId` INT NOT NULL,
        `role` VARCHAR(191) NOT NULL,
        `content` TEXT NOT NULL,
        `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (`id`),
        KEY `ChatMessage_sessionId_fkey` (`sessionId`),
        CONSTRAINT `ChatMessage_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `ChatSession` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- PHẦN 4: TẠO INDEXES
-- ============================================
CREATE INDEX `idx_user_email` ON `User` (`email`);

CREATE INDEX `idx_destination_slug` ON `Destination` (`slug`);

CREATE INDEX `idx_destination_featured` ON `Destination` (`featured`);

CREATE INDEX `idx_booking_user` ON `Booking` (`userId`);

CREATE INDEX `idx_booking_status` ON `Booking` (`status`);

CREATE INDEX `idx_tour_slug` ON `Tour` (`slug`);

CREATE INDEX `idx_tour_featured` ON `Tour` (`featured`);

CREATE INDEX `idx_hotel_slug` ON `Hotel` (`slug`);

CREATE INDEX `idx_restaurant_slug` ON `Restaurant` (`slug`);

-- ============================================
-- PHẦN 5: INSERT DỮ LIỆU MẪU
-- ============================================
-- 5.1. CATEGORIES
INSERT INTO
    `Category` (`id`, `name`)
VALUES
    (1, 'Beach'),
    (2, 'Adventure'),
    (3, 'City'),
    (4, 'Nature'),
    (5, 'Culture') ON DUPLICATE KEY
UPDATE `name` =
VALUES
    (`name`);

-- 5.2. USERS (Admin và User thường)
-- Password hash cho "admin123": $2a$10$rKZ8vN9qJ8vN9qJ8vN9qJ.8vN9qJ8vN9qJ8vN9qJ8vN9qJ8vN9qJ
-- Password hash cho "Phong@2004": $2a$10$Phong2004Phong2004Phong2004Phong2004Phong2004Phong2004Phong2004Phong2004
-- Password hash cho "user123": $2a$10$user123user123user123user123user123user123user123user123user123user123
INSERT INTO
    `User` (
        `id`,
        `email`,
        `passwordHash`,
        `name`,
        `role`,
        `avatarUrl`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        'admin@travelgo.dev',
        '$2a$10$rKZ8vN9qJ8vN9qJ8vN9qJ.8vN9qJ8vN9qJ8vN9qJ8vN9qJ8vN9qJ',
        'Admin',
        'ADMIN',
        NULL,
        NOW(),
        NOW()
    ),
    (
        2,
        'phong@triennguyen.com',
        '$2a$10$Phong2004Phong2004Phong2004Phong2004Phong2004Phong2004Phong2004Phong2004',
        'Phong Admin',
        'ADMIN',
        NULL,
        NOW(),
        NOW()
    ),
    (
        3,
        'user1@example.com',
        '$2a$10$user123user123user123user123user123user123user123user123user123user123',
        'Nguyễn Văn A',
        'USER',
        NULL,
        NOW(),
        NOW()
    ),
    (
        4,
        'user2@example.com',
        '$2a$10$user123user123user123user123user123user123user123user123user123user123',
        'Trần Thị B',
        'USER',
        NULL,
        NOW(),
        NOW()
    ),
    (
        5,
        'user3@example.com',
        '$2a$10$user123user123user123user123user123user123user123user123user123user123',
        'Lê Văn C',
        'USER',
        NULL,
        NOW(),
        NOW()
    ) ON DUPLICATE KEY
UPDATE `email` =
VALUES
    (`email`);

-- 5.3. DESTINATIONS (46 điểm đến)
INSERT INTO
    `Destination` (
        `id`,
        `name`,
        `slug`,
        `description`,
        `image`,
        `country`,
        `featured`,
        `price`,
        `categoryId`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    -- Việt Nam
    (
        1,
        'Ninh Bình',
        'ninh-binh',
        'Di sản Tràng An, Tam Cốc – Bích Động, hang động và non nước hữu tình.',
        '/uploads/avatars/ninh-binh.jpg',
        'Việt Nam',
        1,
        5925000,
        2,
        NOW(),
        NOW()
    ),
    (
        2,
        'Hạ Long',
        'ha-long',
        'Vịnh Hạ Long – kỳ quan thiên nhiên thế giới với du thuyền và hang động.',
        '/uploads/avatars/ha-long4.jpg',
        'Việt Nam',
        1,
        7850000,
        2,
        NOW(),
        NOW()
    ),
    (
        3,
        'Đà Lạt',
        'da-lat',
        'Thành phố sương mù, hoa và những nông trại – khí hậu mát mẻ quanh năm.',
        '/uploads/avatars/da-lat.jpg',
        'Việt Nam',
        1,
        6240000,
        2,
        NOW(),
        NOW()
    ),
    (
        4,
        'Phú Quốc',
        'phu-quoc',
        'Thiên đường nghỉ dưỡng với biển xanh, cát trắng và resort cao cấp.',
        '/uploads/avatars/phu-quoc.jpg',
        'Việt Nam',
        1,
        10950000,
        1,
        NOW(),
        NOW()
    ),
    (
        5,
        'Hà Nội',
        'ha-noi',
        'Thủ đô nghìn năm văn hiến với phố cổ, ẩm thực phong phú và hồ Hoàn Kiếm thơ mộng.',
        '/uploads/avatars/ha-noi.jpg',
        'Việt Nam',
        1,
        8920000,
        3,
        NOW(),
        NOW()
    ),
    (
        6,
        'Đà Nẵng',
        'da-nang',
        'Thành phố đáng sống bên biển với Bà Nà Hills, Ngũ Hành Sơn và những bãi biển tuyệt đẹp.',
        '/uploads/avatars/da-nang.png',
        'Việt Nam',
        1,
        7950000,
        1,
        NOW(),
        NOW()
    ),
    (
        7,
        'Sa Pa',
        'sapa',
        'Thị trấn miền núi với ruộng bậc thang, Fansipan và văn hóa dân tộc đặc sắc.',
        '/uploads/avatars/sapa.jpg',
        'Việt Nam',
        0,
        6030000,
        2,
        NOW(),
        NOW()
    ),
    (
        8,
        'Hội An',
        'hoi-an',
        'Phố cổ Hội An với kiến trúc cổ kính, đèn lồng và ẩm thực đặc sắc.',
        '/uploads/avatars/hoi-an.png',
        'Việt Nam',
        1,
        7520000,
        3,
        NOW(),
        NOW()
    ),
    (
        9,
        'Huế',
        'hue',
        'Cố đô Huế với đền đài, lăng tẩm và di sản văn hóa UNESCO.',
        '/uploads/avatars/hue.jpg',
        'Việt Nam',
        0,
        6820000,
        3,
        NOW(),
        NOW()
    ),
    (
        10,
        'Cần Thơ',
        'can-tho',
        'Thủ phủ miền Tây với chợ nổi Cái Răng, sông nước và văn hóa Nam Bộ.',
        '/uploads/avatars/can-tho.jpg',
        'Việt Nam',
        0,
        5520000,
        3,
        NOW(),
        NOW()
    ),
    (
        11,
        'Vũng Tàu',
        'vung-tau',
        'Thành phố biển gần Sài Gòn với bãi biển, núi Tượng và ẩm thực hải sản.',
        '/uploads/avatars/vung-tau.jpg',
        'Việt Nam',
        0,
        4520000,
        1,
        NOW(),
        NOW()
    ),
    (
        12,
        'Nha Trang',
        'nha-trang',
        'Thành phố biển với bãi biển đẹp, Vinpearl và ẩm thực hải sản tươi ngon.',
        '/uploads/avatars/nha-trang.jpg',
        'Việt Nam',
        1,
        8530000,
        1,
        NOW(),
        NOW()
    ),
    (
        13,
        'Quy Nhơn',
        'quy-nhon',
        'Thành phố biển yên bình với bãi biển hoang sơ và ẩm thực địa phương.',
        '/uploads/avatars/quynhon.jpg',
        'Việt Nam',
        0,
        7240000,
        1,
        NOW(),
        NOW()
    ),
    (
        14,
        'Hà Giang',
        'ha-giang',
        'Vùng đất cực Bắc với hoa tam giác mạch, cột cờ Lũng Cú và phong cảnh hùng vĩ.',
        '/uploads/avatars/hagiang-1.jpg',
        'Việt Nam',
        0,
        5840000,
        2,
        NOW(),
        NOW()
    ),
    (
        15,
        'Mù Cang Chải',
        'mu-cang-chai',
        'Ruộng bậc thang vàng óng mùa lúa chín, phong cảnh núi non hùng vĩ.',
        '/uploads/avatars/mucangchai.jpg',
        'Việt Nam',
        0,
        5540000,
        2,
        NOW(),
        NOW()
    ),
    -- Đông Nam Á
    (
        16,
        'Phuket',
        'phuket',
        'Hòn đảo nổi tiếng của Thái Lan – biển đẹp, tiệc tùng và hoạt động biển.',
        '/uploads/avatars/phuket.jpg',
        'Thái Lan',
        1,
        9875000,
        1,
        NOW(),
        NOW()
    ),
    (
        17,
        'Bangkok',
        'bangkok',
        'Thành phố sôi động với chùa Vàng, kênh đào và ẩm thực đường phố hấp dẫn.',
        '/uploads/avatars/bankok.jpg',
        'Thái Lan',
        1,
        9940000,
        3,
        NOW(),
        NOW()
    ),
    (
        18,
        'Bali',
        'bali',
        'Thiên đường nhiệt đới của Indonesia, nổi tiếng với ruộng bậc thang, đền cổ và bãi biển.',
        '/uploads/avatars/bali.jpg',
        'Indonesia',
        1,
        15920000,
        1,
        NOW(),
        NOW()
    ),
    (
        19,
        'Singapore',
        'singapore',
        'Quốc đảo xanh với Gardens by the Bay, Marina Bay Sands và ẩm thực đa dạng.',
        '/uploads/avatars/singapore.jpg',
        'Singapore',
        1,
        16950000,
        3,
        NOW(),
        NOW()
    ),
    (
        20,
        'Kuala Lumpur',
        'kuala-lumpur',
        'Thủ đô Malaysia với tháp đôi Petronas, ẩm thực đa dạng và mua sắm.',
        '/uploads/avatars/kuala-lumpur.jpg',
        'Malaysia',
        0,
        12930000,
        3,
        NOW(),
        NOW()
    ),
    -- Châu Á
    (
        21,
        'Tokyo',
        'tokyo',
        'Thành phố hiện đại bậc nhất, giao thoa giữa truyền thống và công nghệ.',
        '/uploads/avatars/Tokyo.jpg',
        'Nhật Bản',
        1,
        22950000,
        3,
        NOW(),
        NOW()
    ),
    (
        22,
        'Kyoto',
        'kyoto',
        'Cố đô Nhật Bản với đền chùa, rừng trúc Arashiyama và văn hóa truyền thống.',
        '/uploads/avatars/Kyoto.jpg',
        'Nhật Bản',
        1,
        23920000,
        3,
        NOW(),
        NOW()
    ),
    (
        23,
        'Seoul',
        'seoul',
        'Thủ đô hiện đại với cung điện cổ, K-pop và ẩm thực Hàn Quốc đặc sắc.',
        '/uploads/avatars/Seoul.jpg',
        'Hàn Quốc',
        1,
        14980000,
        3,
        NOW(),
        NOW()
    ),
    (
        24,
        'Busan',
        'busan',
        'Thành phố cảng với bãi biển Haeundae, chợ cá và văn hóa Hàn Quốc.',
        '/uploads/avatars/Busan.jpg',
        'Hàn Quốc',
        0,
        13950000,
        1,
        NOW(),
        NOW()
    ),
    (
        25,
        'Bắc Kinh',
        'beijing',
        'Thủ đô Trung Quốc với Tử Cấm Thành, Vạn Lý Trường Thành và văn hóa cổ kính.',
        '/uploads/avatars/du_lich_bac_kinh_1.jpeg',
        'Trung Quốc',
        0,
        17920000,
        3,
        NOW(),
        NOW()
    ),
    (
        26,
        'Thượng Hải',
        'shanghai',
        'Thành phố hiện đại với skyline ấn tượng, khu phố cổ và mua sắm sang trọng.',
        '/uploads/avatars/thuong-hai.png',
        'Trung Quốc',
        0,
        16980000,
        3,
        NOW(),
        NOW()
    ),
    (
        27,
        'Hồng Kông',
        'hong-kong',
        'Thành phố quốc tế với Victoria Peak, Disneyland và ẩm thực dim sum.',
        '/uploads/avatars/hong-kong.jpg',
        'Hồng Kông',
        0,
        18950000,
        3,
        NOW(),
        NOW()
    ),
    (
        28,
        'Đài Bắc',
        'taipei',
        'Thủ đô Đài Loan với Taipei 101, đền chùa và ẩm thực đêm phố.',
        '/uploads/avatars/đai-bac.jpg',
        'Đài Loan',
        0,
        11920000,
        3,
        NOW(),
        NOW()
    ),
    -- Châu Âu
    (
        29,
        'Paris',
        'paris',
        'Kinh đô ánh sáng với tháp Eiffel, bảo tàng Louvre và những quán cà phê ven đường.',
        '/uploads/avatars/paris.jpg',
        'Pháp',
        1,
        19950000,
        3,
        NOW(),
        NOW()
    ),
    (
        30,
        'London',
        'london',
        'Thành phố cổ kính với Big Ben, Tower Bridge và những bảo tàng lừng danh thế giới.',
        '/uploads/avatars/London.jpg',
        'Anh',
        1,
        18920000,
        3,
        NOW(),
        NOW()
    ),
    (
        31,
        'Rome',
        'rome',
        'Thành phố vĩnh cửu với Colosseum, Vatican và những di tích lịch sử vĩ đại.',
        '/uploads/avatars/Rome.jpg',
        'Ý',
        1,
        17980000,
        3,
        NOW(),
        NOW()
    ),
    (
        32,
        'Barcelona',
        'barcelona',
        'Thành phố nghệ thuật với kiến trúc Gaudi, bãi biển Địa Trung Hải và ẩm thực Tây Ban Nha.',
        '/uploads/avatars/Barcelona.jpg',
        'Tây Ban Nha',
        0,
        15950000,
        3,
        NOW(),
        NOW()
    ),
    (
        33,
        'Amsterdam',
        'amsterdam',
        'Thành phố kênh đào với bảo tàng Van Gogh, nhà cổ và văn hóa tự do.',
        '/uploads/avatars/Amsterdam.jpg',
        'Hà Lan',
        0,
        16920000,
        3,
        NOW(),
        NOW()
    ),
    (
        34,
        'Prague',
        'prague',
        'Thành phố cổ tích với lâu đài Prague, cầu Charles và kiến trúc Gothic tuyệt đẹp.',
        '/uploads/avatars/Prague.jpg',
        'Séc',
        0,
        12980000,
        3,
        NOW(),
        NOW()
    ),
    (
        35,
        'Vienna',
        'vienna',
        'Thủ đô âm nhạc với cung điện Schönbrunn, nhà hát opera và văn hóa cà phê.',
        '/uploads/avatars/vienna.jpg',
        'Áo',
        0,
        14950000,
        3,
        NOW(),
        NOW()
    ),
    (
        36,
        'Santorini',
        'santorini',
        'Hòn đảo Hy Lạp với hoàng hôn tuyệt đẹp, nhà trắng và biển xanh.',
        '/uploads/avatars/Santorini.jpg',
        'Hy Lạp',
        0,
        21920000,
        1,
        NOW(),
        NOW()
    ),
    (
        37,
        'Istanbul',
        'istanbul',
        'Thành phố giao thoa Á-Âu với Hagia Sophia, Grand Bazaar và văn hóa Ottoman.',
        '/uploads/avatars/Istanbul.jpg',
        'Thổ Nhĩ Kỳ',
        0,
        11950000,
        3,
        NOW(),
        NOW()
    ),
    -- Châu Mỹ & Úc
    (
        38,
        'New York',
        'new-york',
        'Thành phố không bao giờ ngủ với Times Square, Central Park và tượng Nữ thần Tự do.',
        '/uploads/avatars/New York.png',
        'Mỹ',
        1,
        24950000,
        3,
        NOW(),
        NOW()
    ),
    (
        39,
        'Los Angeles',
        'los-angeles',
        'Thành phố giải trí với Hollywood, Beverly Hills và bãi biển Venice.',
        '/uploads/avatars/Los Angeles.jpg',
        'Mỹ',
        0,
        22920000,
        3,
        NOW(),
        NOW()
    ),
    (
        40,
        'Grand Canyon',
        'grand-canyon',
        'Hẻm núi kỳ vĩ ở Arizona – trekking, tham quan và ngắm bình minh tuyệt đẹp.',
        '/uploads/avatars/Grand Canyon.jpg',
        'Mỹ',
        0,
        27950000,
        2,
        NOW(),
        NOW()
    ),
    (
        41,
        'Sydney',
        'sydney',
        'Thành phố cảng xinh đẹp với nhà hát Opera, cầu Harbour và những bãi biển tuyệt vời.',
        '/uploads/avatars/Sydney.jpg',
        'Úc',
        1,
        17980000,
        1,
        NOW(),
        NOW()
    ),
    (
        42,
        'Melbourne',
        'melbourne',
        'Thành phố văn hóa với nghệ thuật đường phố, cà phê và ẩm thực đa dạng.',
        '/uploads/avatars/Melbourne.jpg',
        'Úc',
        0,
        16920000,
        3,
        NOW(),
        NOW()
    ),
    -- Khác
    (
        43,
        'Dubai',
        'dubai',
        'Thành phố xa hoa với Burj Khalifa, đảo nhân tạo và những trung tâm mua sắm sang trọng.',
        '/uploads/avatars/Dubai.jpg',
        'UAE',
        1,
        29950000,
        3,
        NOW(),
        NOW()
    ),
    (
        44,
        'Cairo',
        'cairo',
        'Thành phố kim tự tháp với Giza, bảo tàng Ai Cập và sông Nile huyền bí.',
        '/uploads/avatars/Cairo.jpg',
        'Ai Cập',
        0,
        8920000,
        3,
        NOW(),
        NOW()
    ),
    (
        45,
        'Cape Town',
        'cape-town',
        'Thành phố mũi với Table Mountain, bãi biển đẹp và văn hóa Nam Phi đa dạng.',
        '/uploads/avatars/Cape Town.jpg',
        'Nam Phi',
        0,
        13950000,
        2,
        NOW(),
        NOW()
    ),
    (
        46,
        'Marrakech',
        'marrakech',
        'Thành phố đỏ với quảng trường Djemaa el-Fna, souk và kiến trúc Hồi giáo.',
        '/uploads/avatars/Marrakech.jpg',
        'Morocco',
        0,
        10920000,
        3,
        NOW(),
        NOW()
    ) ON DUPLICATE KEY
UPDATE `name` =
VALUES
    (`name`),
    `description` =
VALUES
    (`description`),
    `image` =
VALUES
    (`image`),
    `country` =
VALUES
    (`country`),
    `featured` =
VALUES
    (`featured`),
    `price` =
VALUES
    (`price`),
    `categoryId` =
VALUES
    (`categoryId`);

-- 5.4. TOURS (3 tours mẫu)
INSERT INTO
    `Tour` (
        `id`,
        `name`,
        `slug`,
        `description`,
        `shortDescription`,
        `image`,
        `duration`,
        `price`,
        `originalPrice`,
        `rating`,
        `reviewCount`,
        `tags`,
        `featured`,
        `highlights`,
        `itinerary`,
        `destinationId`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        'Du thuyền Hạ Long 2N1Đ',
        'du-thuyen-ha-long-2n1d',
        'Tour du thuyền đưa bạn qua các hang động, làng chài và thưởng thức hải sản tươi ngon.',
        'Khám phá kỳ quan thiên nhiên thế giới trên du thuyền sang trọng.',
        '/uploads/avatars/ha-long4.jpg',
        2,
        3200000,
        3800000,
        4.7,
        126,
        '["Cruise", "Nature"]',
        0,
        '[{"icon":"ship","text":"Du thuyền 4 sao, phòng view vịnh"},{"icon":"fork-knife","text":"Hải sản tươi sống"},{"icon":"mountain","text":"Thăm hang Sửng Sốt, chèo kayak"}]',
        '[{"day":1,"title":"Check-in & tham quan hang động","activities":["Check-in","Ăn trưa trên tàu","Thăm hang","Câu mực đêm"]},{"day":2,"title":"Kayak & trả phòng","activities":["Kayak","Ăn trưa","Trả phòng"]}]',
        2,
        NOW(),
        NOW()
    ),
    (
        2,
        'City Tour Hà Nội 1 ngày',
        'city-tour-ha-noi-1-ngay',
        'Trải nghiệm thủ đô nghìn năm với hướng dẫn viên địa phương.',
        'Thăm Văn Miếu, Lăng Bác, phố cổ và ẩm thực đường phố.',
        '/uploads/avatars/ha-noi.jpg',
        1,
        890000,
        NULL,
        4.6,
        88,
        '["City", "Culture"]',
        0,
        '[{"icon":"landmark","text":"Văn Miếu, Lăng Bác"},{"icon":"bowl-chopsticks","text":"Phở, bún chả"}]',
        '[{"day":1,"title":"City highlights","activities":["Văn Miếu","Lăng Bác","Phố cổ","Hồ Hoàn Kiếm"]}]',
        5,
        NOW(),
        NOW()
    ),
    (
        3,
        'Khám phá Phú Quốc 3N2Đ',
        'kham-pha-phu-quoc-3n2d',
        'Combo tham quan Nam đảo, VinWonders và VinSafari.',
        'Biển xanh, cát trắng, ngắm hoàng hôn và câu cá đêm.',
        '/uploads/avatars/phu-quoc.jpg',
        3,
        5200000,
        NULL,
        4.8,
        64,
        '["Beach", "Family"]',
        0,
        '[{"icon":"beach","text":"Sunset Sanato"},{"icon":"fish","text":"Câu cá đêm"}]',
        '[{"day":1,"title":"Nam đảo","activities":["Hòn Thơm","Cáp treo","Lặn ngắm san hô"]},{"day":2,"title":"VinWonders & VinSafari","activities":["Công viên chủ đề","Thế giới động vật"]},{"day":3,"title":"Tự do & mua sắm","activities":["Chợ đêm","Đặc sản"]}]',
        4,
        NOW(),
        NOW()
    ) ON DUPLICATE KEY
UPDATE `name` =
VALUES
    (`name`),
    `description` =
VALUES
    (`description`),
    `image` =
VALUES
    (`image`),
    `price` =
VALUES
    (`price`),
    `rating` =
VALUES
    (`rating`);

-- 5.5. HOTELS (50+ hotels đầy đủ)
INSERT INTO
    `Hotel` (
        `id`,
        `name`,
        `slug`,
        `description`,
        `image`,
        `address`,
        `city`,
        `country`,
        `pricePerNight`,
        `rating`,
        `featured`,
        `amenities`,
        `destinationId`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    -- Hạ Long (4)
    (
        1,
        'Halong Bay Luxury Resort',
        'halong-bay-luxury-resort',
        'Resort sang trọng với view vịnh Hạ Long tuyệt đẹp',
        NULL,
        'Bãi Cháy, Hạ Long',
        'Hạ Long',
        'Việt Nam',
        2500000,
        4.8,
        0,
        '["wifi", "pool", "spa", "gym"]',
        2,
        NOW(),
        NOW()
    ),
    (
        2,
        'Halong Bay View Hotel',
        'halong-bay-view-hotel',
        'Khách sạn view vịnh, thuận tiện di chuyển',
        NULL,
        'Trung tâm Hạ Long',
        'Hạ Long',
        'Việt Nam',
        1800000,
        4.5,
        0,
        '["wifi", "pool", "restaurant"]',
        2,
        NOW(),
        NOW()
    ),
    (
        3,
        'Halong Paradise Hotel',
        'halong-paradise-hotel',
        'Nghỉ dưỡng bên bãi biển, không gian yên tĩnh',
        NULL,
        'Bãi Cháy, Hạ Long',
        'Hạ Long',
        'Việt Nam',
        2200000,
        4.6,
        0,
        '["wifi", "beach", "spa"]',
        2,
        NOW(),
        NOW()
    ),
    (
        4,
        'Halong Cruise Hotel',
        'halong-cruise-hotel',
        'Khách sạn gần cảng du thuyền',
        NULL,
        'Cẩm Phả, Hạ Long',
        'Hạ Long',
        'Việt Nam',
        1900000,
        4.4,
        0,
        '["wifi", "restaurant"]',
        2,
        NOW(),
        NOW()
    ),
    -- Phú Quốc (5)
    (
        5,
        'Phu Quoc Beach Hotel',
        'phu-quoc-beach-hotel',
        'Resort biển cao cấp với bãi tắm riêng',
        NULL,
        'Bãi Trường, Phú Quốc',
        'Phú Quốc',
        'Việt Nam',
        3200000,
        4.7,
        0,
        '["wifi", "pool", "beach", "restaurant"]',
        4,
        NOW(),
        NOW()
    ),
    (
        6,
        'Phu Quoc Sunset Resort',
        'phu-quoc-sunset-resort',
        'Resort 5 sao với view hoàng hôn tuyệt đẹp',
        NULL,
        'Bãi Khem, Phú Quốc',
        'Phú Quốc',
        'Việt Nam',
        3800000,
        4.9,
        0,
        '["wifi", "pool", "spa", "gym", "beach"]',
        4,
        NOW(),
        NOW()
    ),
    (
        7,
        'Phu Quoc Ocean View',
        'phu-quoc-ocean-view',
        'Khách sạn view biển, gần trung tâm',
        NULL,
        'Dương Đông, Phú Quốc',
        'Phú Quốc',
        'Việt Nam',
        2800000,
        4.6,
        0,
        '["wifi", "pool", "restaurant"]',
        4,
        NOW(),
        NOW()
    ),
    (
        8,
        'Phu Quoc Pearl Resort',
        'phu-quoc-pearl-resort',
        'Resort cao cấp với spa và nhà hàng',
        NULL,
        'Bãi Sao, Phú Quốc',
        'Phú Quốc',
        'Việt Nam',
        3500000,
        4.8,
        0,
        '["wifi", "pool", "beach", "spa", "gym"]',
        4,
        NOW(),
        NOW()
    ),
    (
        9,
        'Phu Quoc Garden Hotel',
        'phu-quoc-garden-hotel',
        'Khách sạn với vườn xanh, yên tĩnh',
        NULL,
        'An Thới, Phú Quốc',
        'Phú Quốc',
        'Việt Nam',
        2400000,
        4.5,
        0,
        '["wifi", "pool", "garden"]',
        4,
        NOW(),
        NOW()
    ),
    -- Hà Nội (6)
    (
        10,
        'Hanoi Old Quarter Hotel',
        'hanoi-old-quarter-hotel',
        'Khách sạn giữa phố cổ, gần các điểm tham quan',
        NULL,
        'Phố cổ Hà Nội',
        'Hà Nội',
        'Việt Nam',
        1500000,
        4.5,
        0,
        '["wifi", "parking", "restaurant"]',
        5,
        NOW(),
        NOW()
    ),
    (
        11,
        'Hanoi Skyline Hotel',
        'hanoi-skyline-hotel',
        'Khách sạn hiện đại, view toàn cảnh thành phố',
        NULL,
        'Quận Hoàn Kiếm, Hà Nội',
        'Hà Nội',
        'Việt Nam',
        2000000,
        4.7,
        0,
        '["wifi", "pool", "gym", "spa"]',
        5,
        NOW(),
        NOW()
    ),
    (
        12,
        'Hanoi Heritage Hotel',
        'hanoi-heritage-hotel',
        'Khách sạn cổ điển, phong cách Pháp',
        NULL,
        'Quận Ba Đình, Hà Nội',
        'Hà Nội',
        'Việt Nam',
        1800000,
        4.4,
        0,
        '["wifi", "parking", "restaurant"]',
        5,
        NOW(),
        NOW()
    ),
    (
        13,
        'Hanoi Capital Hotel',
        'hanoi-capital-hotel',
        'Khách sạn gần Văn Miếu, giá hợp lý',
        NULL,
        'Quận Đống Đa, Hà Nội',
        'Hà Nội',
        'Việt Nam',
        1600000,
        4.3,
        0,
        '["wifi", "parking"]',
        5,
        NOW(),
        NOW()
    ),
    (
        14,
        'Hanoi Lake View Hotel',
        'hanoi-lake-view-hotel',
        'View hồ Tây, không gian yên tĩnh',
        NULL,
        'Quận Tây Hồ, Hà Nội',
        'Hà Nội',
        'Việt Nam',
        1700000,
        4.5,
        0,
        '["wifi", "parking", "restaurant"]',
        5,
        NOW(),
        NOW()
    ),
    (
        15,
        'Hanoi Business Hotel',
        'hanoi-business-hotel',
        'Khách sạn phục vụ công tác, hội nghị',
        NULL,
        'Quận Cầu Giấy, Hà Nội',
        'Hà Nội',
        'Việt Nam',
        1900000,
        4.6,
        0,
        '["wifi", "gym", "restaurant"]',
        5,
        NOW(),
        NOW()
    ),
    -- Đà Nẵng (5)
    (
        16,
        'Da Nang Beach Resort',
        'da-nang-beach-resort',
        'Resort biển với bãi tắm dài, spa đẳng cấp',
        NULL,
        'Bãi biển Mỹ Khê, Đà Nẵng',
        'Đà Nẵng',
        'Việt Nam',
        2800000,
        4.6,
        0,
        '["wifi", "pool", "beach", "spa"]',
        6,
        NOW(),
        NOW()
    ),
    (
        17,
        'Da Nang City Hotel',
        'da-nang-city-hotel',
        'Khách sạn hiện đại, gần các địa điểm vui chơi',
        NULL,
        'Trung tâm Đà Nẵng',
        'Đà Nẵng',
        'Việt Nam',
        1800000,
        4.5,
        0,
        '["wifi", "pool", "gym"]',
        6,
        NOW(),
        NOW()
    ),
    (
        18,
        'Da Nang Riverside Hotel',
        'da-nang-riverside-hotel',
        'View sông Hàn, gần cầu Rồng',
        NULL,
        'Bờ sông Hàn, Đà Nẵng',
        'Đà Nẵng',
        'Việt Nam',
        2200000,
        4.6,
        0,
        '["wifi", "pool", "restaurant"]',
        6,
        NOW(),
        NOW()
    ),
    (
        19,
        'Da Nang Bay Hotel',
        'da-nang-bay-hotel',
        'Resort view biển, gần Ngũ Hành Sơn',
        NULL,
        'Bãi biển Non Nước, Đà Nẵng',
        'Đà Nẵng',
        'Việt Nam',
        2600000,
        4.7,
        0,
        '["wifi", "pool", "beach", "spa"]',
        6,
        NOW(),
        NOW()
    ),
    (
        20,
        'Da Nang Airport Hotel',
        'da-nang-airport-hotel',
        'Khách sạn gần sân bay, tiện di chuyển',
        NULL,
        'Gần sân bay Đà Nẵng',
        'Đà Nẵng',
        'Việt Nam',
        1500000,
        4.3,
        0,
        '["wifi", "parking"]',
        6,
        NOW(),
        NOW()
    ),
    -- Đà Lạt (5)
    (
        21,
        'Da Lat Mountain View Hotel',
        'da-lat-mountain-view-hotel',
        'Khách sạn view núi, không khí mát mẻ',
        NULL,
        'Trung tâm Đà Lạt',
        'Đà Lạt',
        'Việt Nam',
        1800000,
        4.4,
        0,
        '["wifi", "parking", "garden"]',
        3,
        NOW(),
        NOW()
    ),
    (
        22,
        'Da Lat Flower Garden Hotel',
        'da-lat-flower-garden-hotel',
        'Resort với vườn hoa rộng, view hồ Xuân Hương',
        NULL,
        'Đường Trần Hưng Đạo, Đà Lạt',
        'Đà Lạt',
        'Việt Nam',
        2000000,
        4.6,
        0,
        '["wifi", "parking", "garden", "spa"]',
        3,
        NOW(),
        NOW()
    ),
    (
        23,
        'Da Lat Pine Forest Resort',
        'da-lat-pine-forest-resort',
        'Resort trong rừng thông, yên tĩnh',
        NULL,
        'Đường Trần Quốc Toản, Đà Lạt',
        'Đà Lạt',
        'Việt Nam',
        2500000,
        4.7,
        0,
        '["wifi", "parking", "garden", "spa"]',
        3,
        NOW(),
        NOW()
    ),
    (
        24,
        'Da Lat Lake View Hotel',
        'da-lat-lake-view-hotel',
        'View hồ Xuân Hương, gần trung tâm',
        NULL,
        'Bờ hồ Xuân Hương, Đà Lạt',
        'Đà Lạt',
        'Việt Nam',
        1900000,
        4.5,
        0,
        '["wifi", "parking", "garden"]',
        3,
        NOW(),
        NOW()
    ),
    (
        25,
        'Da Lat Valley Resort',
        'da-lat-valley-resort',
        'Resort view thung lũng, lãng mạn',
        NULL,
        'Thung lũng Tình Yêu, Đà Lạt',
        'Đà Lạt',
        'Việt Nam',
        2300000,
        4.6,
        0,
        '["wifi", "parking", "garden", "spa"]',
        3,
        NOW(),
        NOW()
    ),
    -- Hội An (4)
    (
        26,
        'Hoi An Riverside Hotel',
        'hoi-an-riverside-hotel',
        'Khách sạn bên sông, view phố cổ',
        NULL,
        'Bờ sông Hoài, Hội An',
        'Hội An',
        'Việt Nam',
        2200000,
        4.7,
        0,
        '["wifi", "pool", "spa"]',
        8,
        NOW(),
        NOW()
    ),
    (
        27,
        'Hoi An Ancient Town Hotel',
        'hoi-an-ancient-town-hotel',
        'Khách sạn trong phố cổ, kiến trúc cổ kính',
        NULL,
        'Phố cổ Hội An',
        'Hội An',
        'Việt Nam',
        1800000,
        4.5,
        0,
        '["wifi", "parking"]',
        8,
        NOW(),
        NOW()
    ),
    (
        28,
        'Hoi An Beach Resort',
        'hoi-an-beach-resort',
        'Resort biển cách phố cổ 5km',
        NULL,
        'Bãi biển Cửa Đại, Hội An',
        'Hội An',
        'Việt Nam',
        3000000,
        4.8,
        0,
        '["wifi", "pool", "beach", "spa"]',
        8,
        NOW(),
        NOW()
    ),
    (
        29,
        'Hoi An Garden Hotel',
        'hoi-an-garden-hotel',
        'Khách sạn với vườn xanh, yên tĩnh',
        NULL,
        'Cẩm Thanh, Hội An',
        'Hội An',
        'Việt Nam',
        2000000,
        4.6,
        0,
        '["wifi", "parking", "garden"]',
        8,
        NOW(),
        NOW()
    ),
    -- Nha Trang (4)
    (
        30,
        'Nha Trang Beach Hotel',
        'nha-trang-beach-hotel',
        'Khách sạn view biển, gần Vinpearl',
        NULL,
        'Bãi biển Nha Trang',
        'Nha Trang',
        'Việt Nam',
        2000000,
        4.6,
        0,
        '["wifi", "pool", "beach"]',
        12,
        NOW(),
        NOW()
    ),
    (
        31,
        'Nha Trang Ocean Resort',
        'nha-trang-ocean-resort',
        'Resort biển cao cấp, bãi tắm riêng',
        NULL,
        'Bãi Dài, Nha Trang',
        'Nha Trang',
        'Việt Nam',
        2800000,
        4.7,
        0,
        '["wifi", "pool", "beach", "spa"]',
        12,
        NOW(),
        NOW()
    ),
    (
        32,
        'Nha Trang City Hotel',
        'nha-trang-city-hotel',
        'Khách sạn gần chợ, nhà thờ',
        NULL,
        'Trung tâm Nha Trang',
        'Nha Trang',
        'Việt Nam',
        1700000,
        4.4,
        0,
        '["wifi", "pool"]',
        12,
        NOW(),
        NOW()
    ),
    (
        33,
        'Nha Trang Bay Resort',
        'nha-trang-bay-resort',
        'Resort 5 sao với view vịnh đẹp',
        NULL,
        'Vịnh Nha Trang',
        'Nha Trang',
        'Việt Nam',
        3200000,
        4.8,
        0,
        '["wifi", "pool", "beach", "spa", "gym"]',
        12,
        NOW(),
        NOW()
    ),
    -- Sa Pa (4)
    (
        34,
        'Sapa Mountain Lodge',
        'sapa-mountain-lodge',
        'Lodge view ruộng bậc thang, Fansipan',
        NULL,
        'Trung tâm Sa Pa',
        'Sa Pa',
        'Việt Nam',
        1500000,
        4.5,
        0,
        '["wifi", "parking"]',
        7,
        NOW(),
        NOW()
    ),
    (
        35,
        'Sapa Cloud Hotel',
        'sapa-cloud-hotel',
        'Khách sạn view núi, không khí trong lành',
        NULL,
        'Đường Cầu Mây, Sa Pa',
        'Sa Pa',
        'Việt Nam',
        1800000,
        4.6,
        0,
        '["wifi", "parking", "spa"]',
        7,
        NOW(),
        NOW()
    ),
    (
        36,
        'Sapa Valley Resort',
        'sapa-valley-resort',
        'Resort view thung lũng, ruộng bậc thang',
        NULL,
        'Thung lũng Mường Hoa, Sa Pa',
        'Sa Pa',
        'Việt Nam',
        2200000,
        4.7,
        0,
        '["wifi", "parking", "spa"]',
        7,
        NOW(),
        NOW()
    ),
    (
        37,
        'Sapa Homestay Lodge',
        'sapa-homestay-lodge',
        'Homestay trải nghiệm văn hóa dân tộc',
        NULL,
        'Lào Cai, Sa Pa',
        'Sa Pa',
        'Việt Nam',
        1200000,
        4.3,
        0,
        '["wifi"]',
        7,
        NOW(),
        NOW()
    ),
    -- Ninh Bình (3)
    (
        38,
        'Ninh Binh Heritage Hotel',
        'ninh-binh-heritage-hotel',
        'Khách sạn gần Tràng An, Tam Cốc',
        NULL,
        'Trung tâm Ninh Bình',
        'Ninh Bình',
        'Việt Nam',
        1600000,
        4.5,
        0,
        '["wifi", "parking"]',
        1,
        NOW(),
        NOW()
    ),
    (
        39,
        'Ninh Binh Mountain View',
        'ninh-binh-mountain-view',
        'View núi non, sông nước',
        NULL,
        'Tam Cốc, Ninh Bình',
        'Ninh Bình',
        'Việt Nam',
        1800000,
        4.6,
        0,
        '["wifi", "parking", "garden"]',
        1,
        NOW(),
        NOW()
    ),
    (
        40,
        'Ninh Binh Garden Resort',
        'ninh-binh-garden-resort',
        'Resort với vườn xanh, gần di sản',
        NULL,
        'Tràng An, Ninh Bình',
        'Ninh Bình',
        'Việt Nam',
        2000000,
        4.7,
        0,
        '["wifi", "parking", "garden", "spa"]',
        1,
        NOW(),
        NOW()
    ),
    -- Huế (3)
    (
        41,
        'Hue Imperial Hotel',
        'hue-imperial-hotel',
        'Khách sạn gần cung đình Huế',
        NULL,
        'Gần Đại Nội, Huế',
        'Huế',
        'Việt Nam',
        1700000,
        4.5,
        0,
        '["wifi", "parking"]',
        9,
        NOW(),
        NOW()
    ),
    (
        42,
        'Hue Riverside Hotel',
        'hue-riverside-hotel',
        'View sông Hương, gần cầu Tràng Tiền',
        NULL,
        'Bờ sông Hương, Huế',
        'Huế',
        'Việt Nam',
        1900000,
        4.6,
        0,
        '["wifi", "parking", "restaurant"]',
        9,
        NOW(),
        NOW()
    ),
    (
        43,
        'Hue Heritage Resort',
        'hue-heritage-resort',
        'Resort gần các lăng tẩm',
        NULL,
        'Lăng Khải Định, Huế',
        'Huế',
        'Việt Nam',
        2100000,
        4.7,
        0,
        '["wifi", "parking", "garden", "spa"]',
        9,
        NOW(),
        NOW()
    ),
    -- Cần Thơ (3)
    (
        44,
        'Can Tho Riverside Hotel',
        'can-tho-riverside-hotel',
        'Khách sạn view sông, gần chợ nổi',
        NULL,
        'Bờ sông Cần Thơ',
        'Cần Thơ',
        'Việt Nam',
        1500000,
        4.4,
        0,
        '["wifi", "parking"]',
        10,
        NOW(),
        NOW()
    ),
    (
        45,
        'Can Tho Mekong Hotel',
        'can-tho-mekong-hotel',
        'Khách sạn gần chợ nổi Cái Răng',
        NULL,
        'Trung tâm Cần Thơ',
        'Cần Thơ',
        'Việt Nam',
        1700000,
        4.5,
        0,
        '["wifi", "parking", "restaurant"]',
        10,
        NOW(),
        NOW()
    ),
    (
        46,
        'Can Tho Garden Resort',
        'can-tho-garden-resort',
        'Resort với vườn cây ăn trái',
        NULL,
        'Ninh Kiều, Cần Thơ',
        'Cần Thơ',
        'Việt Nam',
        1900000,
        4.6,
        0,
        '["wifi", "parking", "garden"]',
        10,
        NOW(),
        NOW()
    ),
    -- Vũng Tàu (3)
    (
        47,
        'Vung Tau Beach Hotel',
        'vung-tau-beach-hotel',
        'Khách sạn view biển, gần tượng Chúa',
        NULL,
        'Bãi biển Vũng Tàu',
        'Vũng Tàu',
        'Việt Nam',
        1800000,
        4.5,
        0,
        '["wifi", "pool", "beach"]',
        11,
        NOW(),
        NOW()
    ),
    (
        48,
        'Vung Tau Ocean Resort',
        'vung-tau-ocean-resort',
        'Resort biển với bãi tắm đẹp',
        NULL,
        'Bãi Sau, Vũng Tàu',
        'Vũng Tàu',
        'Việt Nam',
        2200000,
        4.6,
        0,
        '["wifi", "pool", "beach", "spa"]',
        11,
        NOW(),
        NOW()
    ),
    (
        49,
        'Vung Tau City Hotel',
        'vung-tau-city-hotel',
        'Khách sạn gần chợ, nhà hàng',
        NULL,
        'Trung tâm Vũng Tàu',
        'Vũng Tàu',
        'Việt Nam',
        1600000,
        4.4,
        0,
        '["wifi", "parking"]',
        11,
        NOW(),
        NOW()
    ),
    -- Quy Nhơn (2)
    (
        50,
        'Quy Nhon Beach Resort',
        'quy-nhon-beach-resort',
        'Resort biển hoang sơ, yên tĩnh',
        NULL,
        'Bãi biển Quy Nhơn',
        'Quy Nhơn',
        'Việt Nam',
        2000000,
        4.6,
        0,
        '["wifi", "pool", "beach"]',
        13,
        NOW(),
        NOW()
    ),
    (
        51,
        'Quy Nhon City Hotel',
        'quy-nhon-city-hotel',
        'Khách sạn gần các điểm tham quan',
        NULL,
        'Trung tâm Quy Nhơn',
        'Quy Nhơn',
        'Việt Nam',
        1700000,
        4.5,
        0,
        '["wifi", "parking"]',
        13,
        NOW(),
        NOW()
    ),
    -- Hà Giang (2)
    (
        52,
        'Ha Giang Mountain Lodge',
        'ha-giang-mountain-lodge',
        'Lodge view núi, gần cột cờ Lũng Cú',
        NULL,
        'Trung tâm Hà Giang',
        'Hà Giang',
        'Việt Nam',
        1400000,
        4.4,
        0,
        '["wifi", "parking"]',
        14,
        NOW(),
        NOW()
    ),
    (
        53,
        'Ha Giang Valley Hotel',
        'ha-giang-valley-hotel',
        'Khách sạn view thung lũng, hoa tam giác mạch',
        NULL,
        'Đồng Văn, Hà Giang',
        'Hà Giang',
        'Việt Nam',
        1600000,
        4.5,
        0,
        '["wifi", "parking"]',
        14,
        NOW(),
        NOW()
    ),
    -- Mù Cang Chải (2)
    (
        54,
        'Mu Cang Chai Homestay',
        'mu-cang-chai-homestay',
        'Homestay view ruộng bậc thang vàng',
        NULL,
        'Mù Cang Chải',
        'Mù Cang Chải',
        'Việt Nam',
        1200000,
        4.3,
        0,
        '["wifi"]',
        15,
        NOW(),
        NOW()
    ),
    (
        55,
        'Mu Cang Chai Mountain Lodge',
        'mu-cang-chai-mountain-lodge',
        'Lodge view núi, ruộng bậc thang',
        NULL,
        'Yên Bái, Mù Cang Chải',
        'Mù Cang Chải',
        'Việt Nam',
        1500000,
        4.4,
        0,
        '["wifi", "parking"]',
        15,
        NOW(),
        NOW()
    ),
    -- Quốc tế - Thái Lan (3)
    (
        56,
        'Bangkok City Hotel',
        'bangkok-city-hotel',
        'Khách sạn hiện đại giữa trung tâm Bangkok',
        NULL,
        'Sukhumvit, Bangkok',
        'Bangkok',
        'Thái Lan',
        3500000,
        4.5,
        0,
        '["wifi", "pool", "gym", "restaurant"]',
        17,
        NOW(),
        NOW()
    ),
    (
        57,
        'Bangkok Riverside Hotel',
        'bangkok-riverside-hotel',
        'View sông Chao Phraya, gần Wat Pho',
        NULL,
        'Chao Phraya, Bangkok',
        'Bangkok',
        'Thái Lan',
        3200000,
        4.6,
        0,
        '["wifi", "pool", "spa"]',
        17,
        NOW(),
        NOW()
    ),
    (
        58,
        'Phuket Beach Resort',
        'phuket-beach-resort',
        'Resort biển với bãi tắm đẹp',
        NULL,
        'Patong Beach, Phuket',
        'Phuket',
        'Thái Lan',
        3800000,
        4.7,
        0,
        '["wifi", "pool", "beach", "spa"]',
        16,
        NOW(),
        NOW()
    ),
    -- Singapore (2)
    (
        59,
        'Singapore Marina Hotel',
        'singapore-marina-hotel',
        'Khách sạn 5 sao view Marina Bay Sands',
        NULL,
        'Marina Bay, Singapore',
        'Singapore',
        'Singapore',
        4500000,
        4.8,
        0,
        '["wifi", "pool", "spa", "gym"]',
        19,
        NOW(),
        NOW()
    ),
    (
        60,
        'Singapore Orchard Hotel',
        'singapore-orchard-hotel',
        'Khách sạn gần khu mua sắm Orchard',
        NULL,
        'Orchard Road, Singapore',
        'Singapore',
        'Singapore',
        4000000,
        4.7,
        0,
        '["wifi", "pool", "gym"]',
        19,
        NOW(),
        NOW()
    ),
    -- Indonesia (2)
    (
        61,
        'Bali Beach Resort',
        'bali-beach-resort',
        'Resort biển với view hoàng hôn tuyệt đẹp',
        NULL,
        'Seminyak, Bali',
        'Bali',
        'Indonesia',
        4000000,
        4.8,
        0,
        '["wifi", "pool", "beach", "spa"]',
        18,
        NOW(),
        NOW()
    ),
    (
        62,
        'Bali Ubud Resort',
        'bali-ubud-resort',
        'Resort trong rừng, view ruộng bậc thang',
        NULL,
        'Ubud, Bali',
        'Bali',
        'Indonesia',
        3500000,
        4.7,
        0,
        '["wifi", "pool", "garden", "spa"]',
        18,
        NOW(),
        NOW()
    ),
    -- Nhật Bản (2)
    (
        63,
        'Tokyo City Hotel',
        'tokyo-city-hotel',
        'Khách sạn hiện đại giữa trung tâm Tokyo',
        NULL,
        'Shibuya, Tokyo',
        'Tokyo',
        'Nhật Bản',
        5000000,
        4.8,
        0,
        '["wifi", "gym", "restaurant"]',
        21,
        NOW(),
        NOW()
    ),
    (
        64,
        'Kyoto Traditional Hotel',
        'kyoto-traditional-hotel',
        'Khách sạn truyền thống Nhật Bản',
        NULL,
        'Gion, Kyoto',
        'Kyoto',
        'Nhật Bản',
        4800000,
        4.7,
        0,
        '["wifi", "garden"]',
        22,
        NOW(),
        NOW()
    ),
    -- Hàn Quốc (2)
    (
        65,
        'Seoul City Hotel',
        'seoul-city-hotel',
        'Khách sạn gần khu mua sắm Myeongdong',
        NULL,
        'Myeongdong, Seoul',
        'Seoul',
        'Hàn Quốc',
        4200000,
        4.7,
        0,
        '["wifi", "gym", "restaurant"]',
        23,
        NOW(),
        NOW()
    ),
    (
        66,
        'Busan Beach Hotel',
        'busan-beach-hotel',
        'Khách sạn view biển Haeundae',
        NULL,
        'Haeundae Beach, Busan',
        'Busan',
        'Hàn Quốc',
        3800000,
        4.6,
        0,
        '["wifi", "pool", "beach"]',
        24,
        NOW(),
        NOW()
    ) ON DUPLICATE KEY
UPDATE `name` =
VALUES
    (`name`),
    `description` =
VALUES
    (`description`),
    `pricePerNight` =
VALUES
    (`pricePerNight`),
    `rating` =
VALUES
    (`rating`);

-- 5.6. RESTAURANTS (60+ restaurants đầy đủ)
INSERT INTO
    `Restaurant` (
        `id`,
        `name`,
        `slug`,
        `description`,
        `image`,
        `address`,
        `city`,
        `country`,
        `cuisine`,
        `priceRange`,
        `rating`,
        `featured`,
        `amenities`,
        `destinationId`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    -- Hà Nội (6)
    (
        1,
        'Phở Gia Truyền Hà Nội',
        'pho-gia-truyen-ha-noi',
        'Phở bò nổi tiếng, nước dùng đậm đà',
        NULL,
        '49 Bát Đàn, Hà Nội',
        'Hà Nội',
        'Việt Nam',
        'Việt Nam',
        '$$',
        4.8,
        0,
        '["wifi", "parking"]',
        5,
        NOW(),
        NOW()
    ),
    (
        2,
        'Bún Chả Hương Liên',
        'bun-cha-huong-lien',
        'Bún chả Obama đã từng ăn',
        NULL,
        '24 Lê Văn Hưu, Hà Nội',
        'Hà Nội',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.7,
        0,
        '["wifi"]',
        5,
        NOW(),
        NOW()
    ),
    (
        3,
        'Chả Cá Lã Vọng',
        'cha-ca-la-vong',
        'Chả cá truyền thống 100 năm',
        NULL,
        '14 Chả Cá, Hà Nội',
        'Hà Nội',
        'Việt Nam',
        'Việt Nam',
        '$$',
        4.6,
        0,
        '["wifi"]',
        5,
        NOW(),
        NOW()
    ),
    (
        4,
        'Nhà Hàng Ngon',
        'nha-hang-ngon',
        'Tổng hợp ẩm thực 3 miền Bắc-Trung-Nam',
        NULL,
        '26 Tràng Tiền, Hà Nội',
        'Hà Nội',
        'Việt Nam',
        'Việt Nam',
        '$$',
        4.7,
        0,
        '["wifi", "parking"]',
        5,
        NOW(),
        NOW()
    ),
    (
        5,
        'Bánh Cuốn Thanh Trì',
        'banh-cuon-thanh-tri',
        'Bánh cuốn Thanh Trì nổi tiếng',
        NULL,
        'Thanh Trì, Hà Nội',
        'Hà Nội',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.6,
        0,
        '["wifi"]',
        5,
        NOW(),
        NOW()
    ),
    (
        6,
        'Nem Nướng Nha Trang Hà Nội',
        'nem-nuong-nha-trang-ha-noi',
        'Nem nướng Nha Trang đặc sản',
        NULL,
        'Quận Hai Bà Trưng, Hà Nội',
        'Hà Nội',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.5,
        0,
        '["wifi"]',
        5,
        NOW(),
        NOW()
    ),
    -- Phú Quốc (5)
    (
        7,
        'Hải Sản Phú Quốc',
        'hai-san-phu-quoc',
        'Hải sản tươi sống, view biển',
        NULL,
        'Bãi Dài, Phú Quốc',
        'Phú Quốc',
        'Việt Nam',
        'Hải sản',
        '$$$',
        4.7,
        0,
        '["wifi", "outdoor"]',
        4,
        NOW(),
        NOW()
    ),
    (
        8,
        'Nhà Hàng Cá Ngừ Đại Dương',
        'nha-hang-ca-ngu-dai-duong',
        'Chuyên các món cá ngừ, cá thu',
        NULL,
        'Dương Đông, Phú Quốc',
        'Phú Quốc',
        'Việt Nam',
        'Hải sản',
        '$$$',
        4.8,
        0,
        '["wifi", "outdoor"]',
        4,
        NOW(),
        NOW()
    ),
    (
        9,
        'Quán Nướng Phú Quốc',
        'quan-nuong-phu-quoc',
        'Hải sản nướng tại bàn',
        NULL,
        'Bãi Trường, Phú Quốc',
        'Phú Quốc',
        'Việt Nam',
        'BBQ',
        '$$',
        4.6,
        0,
        '["wifi", "outdoor"]',
        4,
        NOW(),
        NOW()
    ),
    (
        10,
        'Nhà Hàng Nướng Cá Phú Quốc',
        'nha-hang-nuong-ca-phu-quoc',
        'Cá nướng than hoa, tươi ngon',
        NULL,
        'An Thới, Phú Quốc',
        'Phú Quốc',
        'Việt Nam',
        'Hải sản',
        '$$',
        4.7,
        0,
        '["wifi", "outdoor"]',
        4,
        NOW(),
        NOW()
    ),
    (
        11,
        'Quán Hải Sản Bãi Sao',
        'quan-hai-san-bai-sao',
        'Hải sản tươi, view biển đẹp',
        NULL,
        'Bãi Sao, Phú Quốc',
        'Phú Quốc',
        'Việt Nam',
        'Hải sản',
        '$$$',
        4.8,
        0,
        '["wifi", "outdoor"]',
        4,
        NOW(),
        NOW()
    ),
    -- Hội An (5)
    (
        12,
        'Cơm Gà Hội An',
        'com-ga-hoi-an',
        'Cơm gà đặc sản Hội An',
        NULL,
        'Phố cổ Hội An',
        'Hội An',
        'Việt Nam',
        'Việt Nam',
        '$$',
        4.6,
        0,
        '["wifi"]',
        8,
        NOW(),
        NOW()
    ),
    (
        13,
        'Cao Lầu Bà Bé',
        'cao-lau-ba-be',
        'Cao lầu nổi tiếng, nước dùng đậm đà',
        NULL,
        'Phố cổ Hội An',
        'Hội An',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.8,
        0,
        '["wifi"]',
        8,
        NOW(),
        NOW()
    ),
    (
        14,
        'Bánh Mì Phượng',
        'banh-mi-phuong',
        'Bánh mì được Anthony Bourdain khen',
        NULL,
        'Phố cổ Hội An',
        'Hội An',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.7,
        0,
        '["wifi"]',
        8,
        NOW(),
        NOW()
    ),
    (
        15,
        'Bánh Đập Hội An',
        'banh-dap-hoi-an',
        'Bánh đập đặc sản Hội An',
        NULL,
        'Phố cổ Hội An',
        'Hội An',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.5,
        0,
        '["wifi"]',
        8,
        NOW(),
        NOW()
    ),
    (
        16,
        'Nhà Hàng Hội An',
        'nha-hang-hoi-an',
        'Tổng hợp ẩm thực Hội An',
        NULL,
        'Cẩm Thanh, Hội An',
        'Hội An',
        'Việt Nam',
        'Việt Nam',
        '$$',
        4.6,
        0,
        '["wifi", "parking"]',
        8,
        NOW(),
        NOW()
    ),
    -- Đà Nẵng (5)
    (
        17,
        'Seafood Restaurant Đà Nẵng',
        'seafood-restaurant-da-nang',
        'Hải sản tươi, view biển',
        NULL,
        'Bãi biển Mỹ Khê, Đà Nẵng',
        'Đà Nẵng',
        'Việt Nam',
        'Hải sản',
        '$$$',
        4.8,
        0,
        '["wifi", "outdoor"]',
        6,
        NOW(),
        NOW()
    ),
    (
        18,
        'Quán Bê Thui Cầu Mống',
        'quan-be-thui-cau-mong',
        'Bê thui nổi tiếng Đà Nẵng',
        NULL,
        'Quận Sơn Trà, Đà Nẵng',
        'Đà Nẵng',
        'Việt Nam',
        'Việt Nam',
        '$$',
        4.7,
        0,
        '["wifi"]',
        6,
        NOW(),
        NOW()
    ),
    (
        19,
        'Mì Quảng Ba Mua',
        'mi-quang-ba-mua',
        'Mì Quảng đặc sản miền Trung',
        NULL,
        'Quận Hải Châu, Đà Nẵng',
        'Đà Nẵng',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.6,
        0,
        '["wifi"]',
        6,
        NOW(),
        NOW()
    ),
    (
        20,
        'Bánh Xèo Đà Nẵng',
        'banh-xeo-da-nang',
        'Bánh xèo giòn, nhân tôm thịt',
        NULL,
        'Quận Thanh Khê, Đà Nẵng',
        'Đà Nẵng',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.5,
        0,
        '["wifi"]',
        6,
        NOW(),
        NOW()
    ),
    (
        21,
        'Nhà Hàng Hải Sản Sơn Trà',
        'nha-hang-hai-san-son-tra',
        'Hải sản tươi, view biển đẹp',
        NULL,
        'Bán đảo Sơn Trà, Đà Nẵng',
        'Đà Nẵng',
        'Việt Nam',
        'Hải sản',
        '$$$',
        4.7,
        0,
        '["wifi", "outdoor"]',
        6,
        NOW(),
        NOW()
    ),
    -- Đà Lạt (5)
    (
        22,
        'Nhà hàng Đà Lạt',
        'nha-hang-da-lat',
        'Ẩm thực Đà Lạt, rau củ tươi',
        NULL,
        'Trung tâm Đà Lạt',
        'Đà Lạt',
        'Việt Nam',
        'Việt Nam',
        '$$',
        4.4,
        0,
        '["wifi", "parking"]',
        3,
        NOW(),
        NOW()
    ),
    (
        23,
        'Lẩu Gà Lá É Đà Lạt',
        'lau-ga-la-e-da-lat',
        'Lẩu gà lá é đặc trưng Đà Lạt',
        NULL,
        'Đường Trần Hưng Đạo, Đà Lạt',
        'Đà Lạt',
        'Việt Nam',
        'Việt Nam',
        '$$',
        4.6,
        0,
        '["wifi"]',
        3,
        NOW(),
        NOW()
    ),
    (
        24,
        'Bánh Căn Đà Lạt',
        'banh-can-da-lat',
        'Bánh căn nóng, ăn kèm trứng',
        NULL,
        'Chợ Đà Lạt',
        'Đà Lạt',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.5,
        0,
        '["wifi"]',
        3,
        NOW(),
        NOW()
    ),
    (
        25,
        'Nem Nướng Đà Lạt',
        'nem-nuong-da-lat',
        'Nem nướng đặc sản Đà Lạt',
        NULL,
        'Đường Nguyễn Chí Thanh, Đà Lạt',
        'Đà Lạt',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.6,
        0,
        '["wifi"]',
        3,
        NOW(),
        NOW()
    ),
    (
        26,
        'Nhà Hàng Rau Củ Đà Lạt',
        'nha-hang-rau-cu-da-lat',
        'Món chay từ rau củ tươi Đà Lạt',
        NULL,
        'Trung tâm Đà Lạt',
        'Đà Lạt',
        'Việt Nam',
        'Chay',
        '$$',
        4.5,
        0,
        '["wifi", "parking"]',
        3,
        NOW(),
        NOW()
    ),
    -- Huế (4)
    (
        27,
        'Bún Bò Huế',
        'bun-bo-hue',
        'Bún bò Huế chính gốc',
        NULL,
        'Trung tâm Huế',
        'Huế',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.5,
        0,
        '["wifi"]',
        9,
        NOW(),
        NOW()
    ),
    (
        28,
        'Cơm Hến Bà Hoa',
        'com-hen-ba-hoa',
        'Cơm hến đặc sản xứ Huế',
        NULL,
        'Đường Lê Lợi, Huế',
        'Huế',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.6,
        0,
        '["wifi"]',
        9,
        NOW(),
        NOW()
    ),
    (
        29,
        'Nhà Hàng Hoàng Gia',
        'nha-hang-hoang-gia',
        'Ẩm thực cung đình Huế',
        NULL,
        'Đường Lê Lợi, Huế',
        'Huế',
        'Việt Nam',
        'Cung đình',
        '$$$',
        4.7,
        0,
        '["wifi", "parking"]',
        9,
        NOW(),
        NOW()
    ),
    (
        30,
        'Bánh Bèo Huế',
        'banh-beo-hue',
        'Bánh bèo, bánh nậm đặc sản Huế',
        NULL,
        'Phố cổ Huế',
        'Huế',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.6,
        0,
        '["wifi"]',
        9,
        NOW(),
        NOW()
    ),
    -- Nha Trang (4)
    (
        31,
        'Hải Sản Nha Trang',
        'hai-san-nha-trang',
        'Hải sản tươi, view biển',
        NULL,
        'Bãi biển Nha Trang',
        'Nha Trang',
        'Việt Nam',
        'Hải sản',
        '$$$',
        4.7,
        0,
        '["wifi", "outdoor"]',
        12,
        NOW(),
        NOW()
    ),
    (
        32,
        'Bún Sứa Nha Trang',
        'bun-sua-nha-trang',
        'Bún sứa đặc sản Nha Trang',
        NULL,
        'Trung tâm Nha Trang',
        'Nha Trang',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.6,
        0,
        '["wifi"]',
        12,
        NOW(),
        NOW()
    ),
    (
        33,
        'Nem Nướng Nha Trang',
        'nem-nuong-nha-trang',
        'Nem nướng Nha Trang nổi tiếng',
        NULL,
        'Chợ Đầm, Nha Trang',
        'Nha Trang',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.7,
        0,
        '["wifi"]',
        12,
        NOW(),
        NOW()
    ),
    (
        34,
        'Nhà Hàng Hải Sản Vịnh',
        'nha-hang-hai-san-vinh',
        'Hải sản tươi, view vịnh đẹp',
        NULL,
        'Vịnh Nha Trang',
        'Nha Trang',
        'Việt Nam',
        'Hải sản',
        '$$$',
        4.8,
        0,
        '["wifi", "outdoor"]',
        12,
        NOW(),
        NOW()
    ),
    -- Sa Pa (3)
    (
        35,
        'Nhà Hàng Thổ Cẩm',
        'nha-hang-tho-cam',
        'Ẩm thực dân tộc vùng cao',
        NULL,
        'Trung tâm Sa Pa',
        'Sa Pa',
        'Việt Nam',
        'Dân tộc',
        '$$',
        4.5,
        0,
        '["wifi"]',
        7,
        NOW(),
        NOW()
    ),
    (
        36,
        'Lẩu Cá Hồi Sa Pa',
        'lau-ca-hoi-sapa',
        'Lẩu cá hồi tươi, thịt bò',
        NULL,
        'Đường Cầu Mây, Sa Pa',
        'Sa Pa',
        'Việt Nam',
        'Việt Nam',
        '$$',
        4.6,
        0,
        '["wifi"]',
        7,
        NOW(),
        NOW()
    ),
    (
        37,
        'Thắng Cố Sa Pa',
        'thang-co-sapa',
        'Thắng cố đặc sản vùng cao',
        NULL,
        'Bản Cát Cát, Sa Pa',
        'Sa Pa',
        'Việt Nam',
        'Dân tộc',
        '$$',
        4.4,
        0,
        '["wifi"]',
        7,
        NOW(),
        NOW()
    ),
    -- Ninh Bình (3)
    (
        38,
        'Dê Núi Ninh Bình',
        'de-nui-ninh-binh',
        'Dê núi nướng, nấu lẩu',
        NULL,
        'Tam Cốc, Ninh Bình',
        'Ninh Bình',
        'Việt Nam',
        'Việt Nam',
        '$$',
        4.6,
        0,
        '["wifi"]',
        1,
        NOW(),
        NOW()
    ),
    (
        39,
        'Cơm Cháy Ninh Bình',
        'com-chay-ninh-binh',
        'Cơm cháy đặc sản Ninh Bình',
        NULL,
        'Tràng An, Ninh Bình',
        'Ninh Bình',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.5,
        0,
        '["wifi"]',
        1,
        NOW(),
        NOW()
    ),
    (
        40,
        'Nhà Hàng Sông Nước',
        'nha-hang-song-nuoc',
        'Nhà hàng view sông, núi non',
        NULL,
        'Tam Cốc, Ninh Bình',
        'Ninh Bình',
        'Việt Nam',
        'Việt Nam',
        '$$',
        4.7,
        0,
        '["wifi", "outdoor"]',
        1,
        NOW(),
        NOW()
    ),
    -- Cần Thơ (3)
    (
        41,
        'Nhà Hàng Chợ Nổi',
        'nha-hang-cho-noi',
        'Ẩm thực miền Tây trên chợ nổi',
        NULL,
        'Chợ nổi Cái Răng, Cần Thơ',
        'Cần Thơ',
        'Việt Nam',
        'Việt Nam',
        '$$',
        4.5,
        0,
        '["wifi"]',
        10,
        NOW(),
        NOW()
    ),
    (
        42,
        'Lẩu Mắm Cần Thơ',
        'lau-mam-can-tho',
        'Lẩu mắm đặc sản miền Tây',
        NULL,
        'Trung tâm Cần Thơ',
        'Cần Thơ',
        'Việt Nam',
        'Việt Nam',
        '$$',
        4.6,
        0,
        '["wifi"]',
        10,
        NOW(),
        NOW()
    ),
    (
        43,
        'Bánh Tét Cần Thơ',
        'banh-tet-can-tho',
        'Bánh tét, bánh ít đặc sản',
        NULL,
        'Ninh Kiều, Cần Thơ',
        'Cần Thơ',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.5,
        0,
        '["wifi"]',
        10,
        NOW(),
        NOW()
    ),
    -- Vũng Tàu (3)
    (
        44,
        'Hải Sản Vũng Tàu',
        'hai-san-vung-tau',
        'Hải sản tươi, view biển',
        NULL,
        'Bãi biển Vũng Tàu',
        'Vũng Tàu',
        'Việt Nam',
        'Hải sản',
        '$$$',
        4.6,
        0,
        '["wifi", "outdoor"]',
        11,
        NOW(),
        NOW()
    ),
    (
        45,
        'Bánh Khọt Vũng Tàu',
        'banh-khot-vung-tau',
        'Bánh khọt đặc sản Vũng Tàu',
        NULL,
        'Trung tâm Vũng Tàu',
        'Vũng Tàu',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.5,
        0,
        '["wifi"]',
        11,
        NOW(),
        NOW()
    ),
    (
        46,
        'Nhà Hàng Biển Vũng Tàu',
        'nha-hang-bien-vung-tau',
        'Hải sản tươi, không gian đẹp',
        NULL,
        'Bãi Sau, Vũng Tàu',
        'Vũng Tàu',
        'Việt Nam',
        'Hải sản',
        '$$$',
        4.7,
        0,
        '["wifi", "outdoor"]',
        11,
        NOW(),
        NOW()
    ),
    -- Quy Nhơn (2)
    (
        47,
        'Hải Sản Quy Nhơn',
        'hai-san-quy-nhon',
        'Hải sản tươi, view biển hoang sơ',
        NULL,
        'Bãi biển Quy Nhơn',
        'Quy Nhơn',
        'Việt Nam',
        'Hải sản',
        '$$$',
        4.6,
        0,
        '["wifi", "outdoor"]',
        13,
        NOW(),
        NOW()
    ),
    (
        48,
        'Bánh Xèo Quy Nhơn',
        'banh-xeo-quy-nhon',
        'Bánh xèo đặc sản Quy Nhơn',
        NULL,
        'Trung tâm Quy Nhơn',
        'Quy Nhơn',
        'Việt Nam',
        'Việt Nam',
        '$',
        4.5,
        0,
        '["wifi"]',
        13,
        NOW(),
        NOW()
    ),
    -- Hà Giang (2)
    (
        49,
        'Nhà Hàng Vùng Cao',
        'nha-hang-vung-cao',
        'Ẩm thực dân tộc vùng cao',
        NULL,
        'Đồng Văn, Hà Giang',
        'Hà Giang',
        'Việt Nam',
        'Dân tộc',
        '$$',
        4.4,
        0,
        '["wifi"]',
        14,
        NOW(),
        NOW()
    ),
    (
        50,
        'Thắng Cố Hà Giang',
        'thang-co-ha-giang',
        'Thắng cố đặc sản vùng cao',
        NULL,
        'Mèo Vạc, Hà Giang',
        'Hà Giang',
        'Việt Nam',
        'Dân tộc',
        '$$',
        4.5,
        0,
        '["wifi"]',
        14,
        NOW(),
        NOW()
    ),
    -- Mù Cang Chải (2)
    (
        51,
        'Nhà Hàng Ruộng Bậc Thang',
        'nha-hang-ruong-bac-thang',
        'Ẩm thực dân tộc, view ruộng bậc thang',
        NULL,
        'Mù Cang Chải',
        'Mù Cang Chải',
        'Việt Nam',
        'Dân tộc',
        '$$',
        4.4,
        0,
        '["wifi"]',
        15,
        NOW(),
        NOW()
    ),
    (
        52,
        'Cơm Lam Mù Cang Chải',
        'com-lam-mu-cang-chai',
        'Cơm lam đặc sản vùng cao',
        NULL,
        'Yên Bái, Mù Cang Chải',
        'Mù Cang Chải',
        'Việt Nam',
        'Dân tộc',
        '$',
        4.3,
        0,
        '["wifi"]',
        15,
        NOW(),
        NOW()
    ),
    -- Quốc tế - Thái Lan (4)
    (
        53,
        'Thai Street Food Bangkok',
        'thai-street-food-bangkok',
        'Pad Thai, Tom Yum, Mango Sticky Rice',
        NULL,
        'Khao San Road, Bangkok',
        'Bangkok',
        'Thái Lan',
        'Thái Lan',
        '$',
        4.7,
        0,
        '["wifi"]',
        17,
        NOW(),
        NOW()
    ),
    (
        54,
        'Tom Yum Goong Bangkok',
        'tom-yum-goong-bangkok',
        'Tom Yum Goong chính gốc',
        NULL,
        'Sukhumvit, Bangkok',
        'Bangkok',
        'Thái Lan',
        'Thái Lan',
        '$$',
        4.8,
        0,
        '["wifi"]',
        17,
        NOW(),
        NOW()
    ),
    (
        55,
        'Phuket Seafood Restaurant',
        'phuket-seafood-restaurant',
        'Hải sản tươi, view biển',
        NULL,
        'Patong Beach, Phuket',
        'Phuket',
        'Thái Lan',
        'Hải sản',
        '$$$',
        4.7,
        0,
        '["wifi", "outdoor"]',
        16,
        NOW(),
        NOW()
    ),
    (
        56,
        'Green Curry Phuket',
        'green-curry-phuket',
        'Green Curry, Massaman Curry',
        NULL,
        'Kata Beach, Phuket',
        'Phuket',
        'Thái Lan',
        'Thái Lan',
        '$$',
        4.6,
        0,
        '["wifi"]',
        16,
        NOW(),
        NOW()
    ),
    -- Singapore (3)
    (
        57,
        'Singapore Hawker Center',
        'singapore-hawker-center',
        'Chicken Rice, Laksa, Chili Crab',
        NULL,
        'Chinatown, Singapore',
        'Singapore',
        'Singapore',
        'Singapore',
        '$',
        4.6,
        0,
        '["wifi"]',
        19,
        NOW(),
        NOW()
    ),
    (
        58,
        'Singapore Chili Crab',
        'singapore-chili-crab',
        'Chili Crab nổi tiếng Singapore',
        NULL,
        'Marina Bay, Singapore',
        'Singapore',
        'Singapore',
        'Singapore',
        '$$$',
        4.8,
        0,
        '["wifi"]',
        19,
        NOW(),
        NOW()
    ),
    (
        59,
        'Singapore Laksa',
        'singapore-laksa',
        'Laksa Singapore chính gốc',
        NULL,
        'Little India, Singapore',
        'Singapore',
        'Singapore',
        'Singapore',
        '$',
        4.7,
        0,
        '["wifi"]',
        19,
        NOW(),
        NOW()
    ),
    -- Indonesia (2)
    (
        60,
        'Bali Warung Ubud',
        'bali-warung-ubud',
        'Nasi Goreng, Satay, Babi Guling',
        NULL,
        'Ubud, Bali',
        'Bali',
        'Indonesia',
        'Indonesia',
        '$$',
        4.7,
        0,
        '["wifi", "outdoor"]',
        18,
        NOW(),
        NOW()
    ),
    (
        61,
        'Bali Beach Restaurant',
        'bali-beach-restaurant',
        'Hải sản tươi, view hoàng hôn',
        NULL,
        'Seminyak, Bali',
        'Bali',
        'Indonesia',
        'Hải sản',
        '$$$',
        4.8,
        0,
        '["wifi", "outdoor"]',
        18,
        NOW(),
        NOW()
    ),
    -- Nhật Bản (3)
    (
        62,
        'Tokyo Sushi Bar',
        'tokyo-sushi-bar',
        'Sushi, Sashimi tươi ngon',
        NULL,
        'Shibuya, Tokyo',
        'Tokyo',
        'Nhật Bản',
        'Nhật Bản',
        '$$$',
        4.8,
        0,
        '["wifi"]',
        21,
        NOW(),
        NOW()
    ),
    (
        63,
        'Tokyo Ramen Shop',
        'tokyo-ramen-shop',
        'Ramen chính gốc Tokyo',
        NULL,
        'Shinjuku, Tokyo',
        'Tokyo',
        'Nhật Bản',
        'Nhật Bản',
        '$',
        4.7,
        0,
        '["wifi"]',
        21,
        NOW(),
        NOW()
    ),
    (
        64,
        'Kyoto Kaiseki Restaurant',
        'kyoto-kaiseki-restaurant',
        'Kaiseki truyền thống Nhật Bản',
        NULL,
        'Gion, Kyoto',
        'Kyoto',
        'Nhật Bản',
        'Nhật Bản',
        '$$$$',
        4.9,
        0,
        '["wifi"]',
        22,
        NOW(),
        NOW()
    ),
    -- Hàn Quốc (3)
    (
        65,
        'Seoul BBQ Restaurant',
        'seoul-bbq-restaurant',
        'Korean BBQ, Bulgogi, Galbi',
        NULL,
        'Myeongdong, Seoul',
        'Seoul',
        'Hàn Quốc',
        'Hàn Quốc',
        '$$',
        4.7,
        0,
        '["wifi"]',
        23,
        NOW(),
        NOW()
    ),
    (
        66,
        'Seoul Kimchi House',
        'seoul-kimchi-house',
        'Kimchi, Bibimbap, Tteokbokki',
        NULL,
        'Insadong, Seoul',
        'Seoul',
        'Hàn Quốc',
        'Hàn Quốc',
        '$',
        4.6,
        0,
        '["wifi"]',
        23,
        NOW(),
        NOW()
    ),
    (
        67,
        'Busan Seafood Market',
        'busan-seafood-market',
        'Hải sản tươi sống, sashimi',
        NULL,
        'Jagalchi Market, Busan',
        'Busan',
        'Hàn Quốc',
        'Hải sản',
        '$$$',
        4.8,
        0,
        '["wifi"]',
        24,
        NOW(),
        NOW()
    ) ON DUPLICATE KEY
UPDATE `name` =
VALUES
    (`name`),
    `description` =
VALUES
    (`description`),
    `rating` =
VALUES
    (`rating`);

-- 5.7. REVIEWS (10 reviews mẫu)
INSERT INTO
    `Review` (
        `id`,
        `userId`,
        `destinationId`,
        `rating`,
        `comment`,
        `createdAt`
    )
VALUES
    (
        1,
        3,
        5,
        5,
        'Ẩm thực phố cổ quá tuyệt, người dân thân thiện. Hà Nội thật sự là một thành phố đáng sống!',
        NOW()
    ),
    (
        2,
        4,
        6,
        5,
        'Biển đẹp, thành phố sạch và hiện đại. Đà Nẵng là điểm đến lý tưởng cho gia đình.',
        NOW()
    ),
    (
        3,
        3,
        29,
        5,
        'Bảo tàng Louvre và tháp Eiffel không thể bỏ lỡ. Paris thật sự là kinh đô ánh sáng!',
        NOW()
    ),
    (
        4,
        4,
        18,
        5,
        'Thiên nhiên tuyệt vời, dịch vụ tốt. Bali là thiên đường nghỉ dưỡng hoàn hảo.',
        NOW()
    ),
    (
        5,
        5,
        21,
        4,
        'Hiện đại nhưng vẫn giữ nét truyền thống. Tokyo là thành phố đáng trải nghiệm.',
        NOW()
    ),
    (
        6,
        3,
        2,
        5,
        'Vịnh Hạ Long đẹp tuyệt vời! Du thuyền rất sang trọng và dịch vụ chu đáo.',
        NOW()
    ),
    (
        7,
        4,
        4,
        5,
        'Phú Quốc có biển xanh, cát trắng. Resort rất đẹp và ẩm thực hải sản tươi ngon.',
        NOW()
    ),
    (
        8,
        5,
        8,
        4,
        'Phố cổ Hội An rất đẹp vào ban đêm với đèn lồng. Ẩm thực đặc sắc.',
        NOW()
    ),
    (
        9,
        3,
        19,
        5,
        'Singapore sạch sẽ, hiện đại. Gardens by the Bay và Marina Bay Sands rất ấn tượng.',
        NOW()
    ),
    (
        10,
        4,
        1,
        4,
        'Ninh Bình có cảnh đẹp, Tràng An và Tam Cốc rất hữu tình. Đáng để tham quan.',
        NOW()
    ) ON DUPLICATE KEY
UPDATE `rating` =
VALUES
    (`rating`),
    `comment` =
VALUES
    (`comment`);

-- 5.8. BOOKINGS (5 bookings mẫu)
INSERT INTO
    `Booking` (
        `id`,
        `code`,
        `userId`,
        `destinationId`,
        `status`,
        `totalAmount`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        'BK001',
        3,
        5,
        'CONFIRMED',
        8920000,
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        DATE_SUB(NOW(), INTERVAL 10 DAY)
    ),
    (
        2,
        'BK002',
        4,
        6,
        'COMPLETED',
        7950000,
        DATE_SUB(NOW(), INTERVAL 20 DAY),
        DATE_SUB(NOW(), INTERVAL 5 DAY)
    ),
    (
        3,
        'BK003',
        5,
        2,
        'PENDING',
        7850000,
        DATE_SUB(NOW(), INTERVAL 2 DAY),
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ),
    (
        4,
        'BK004',
        3,
        4,
        'CONFIRMED',
        10950000,
        DATE_SUB(NOW(), INTERVAL 5 DAY),
        DATE_SUB(NOW(), INTERVAL 5 DAY)
    ),
    (
        5,
        'BK005',
        4,
        8,
        'COMPLETED',
        7520000,
        DATE_SUB(NOW(), INTERVAL 30 DAY),
        DATE_SUB(NOW(), INTERVAL 25 DAY)
    ) ON DUPLICATE KEY
UPDATE `status` =
VALUES
    (`status`),
    `totalAmount` =
VALUES
    (`totalAmount`);

-- 5.9. PAYMENTS (5 payments mẫu)
INSERT INTO
    `Payment` (
        `id`,
        `bookingId`,
        `amount`,
        `status`,
        `provider`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        1,
        8920000,
        'SUCCESS',
        'VNPay',
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        DATE_SUB(NOW(), INTERVAL 10 DAY)
    ),
    (
        2,
        2,
        7950000,
        'SUCCESS',
        'Momo',
        DATE_SUB(NOW(), INTERVAL 20 DAY),
        DATE_SUB(NOW(), INTERVAL 20 DAY)
    ),
    (
        3,
        3,
        7850000,
        'PENDING',
        'Stripe',
        DATE_SUB(NOW(), INTERVAL 2 DAY),
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ),
    (
        4,
        4,
        10950000,
        'SUCCESS',
        'PayPal',
        DATE_SUB(NOW(), INTERVAL 5 DAY),
        DATE_SUB(NOW(), INTERVAL 5 DAY)
    ),
    (
        5,
        5,
        7520000,
        'SUCCESS',
        'VNPay',
        DATE_SUB(NOW(), INTERVAL 30 DAY),
        DATE_SUB(NOW(), INTERVAL 30 DAY)
    ) ON DUPLICATE KEY
UPDATE `status` =
VALUES
    (`status`),
    `amount` =
VALUES
    (`amount`);

-- 5.10. WISHLIST (5 wishlist items)
INSERT INTO
    `Wishlist` (`id`, `userId`, `destinationId`, `createdAt`)
VALUES
    (1, 3, 29, NOW()),
    (2, 3, 21, NOW()),
    (3, 4, 18, NOW()),
    (4, 4, 19, NOW()),
    (5, 5, 43, NOW()) ON DUPLICATE KEY
UPDATE `createdAt` =
VALUES
    (`createdAt`);

-- 5.11. NOTIFICATIONS (5 notifications mẫu)
INSERT INTO
    `Notification` (
        `id`,
        `userId`,
        `type`,
        `message`,
        `read`,
        `createdAt`
    )
VALUES
    (
        1,
        3,
        'booking',
        'Đặt chỗ của bạn đã được xác nhận!',
        0,
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    ),
    (
        2,
        4,
        'payment',
        'Thanh toán thành công cho booking BK002',
        1,
        DATE_SUB(NOW(), INTERVAL 20 DAY)
    ),
    (
        3,
        5,
        'promotion',
        'Giảm giá 20% cho các tour Hạ Long!',
        0,
        DATE_SUB(NOW(), INTERVAL 3 DAY)
    ),
    (
        4,
        3,
        'review',
        'Cảm ơn bạn đã đánh giá điểm đến!',
        1,
        DATE_SUB(NOW(), INTERVAL 5 DAY)
    ),
    (
        5,
        4,
        'booking',
        'Đặt chỗ của bạn đang chờ xác nhận',
        0,
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ) ON DUPLICATE KEY
UPDATE `read` =
VALUES
    (`read`),
    `message` =
VALUES
    (`message`);

-- 5.12. LOYALTY (3 loyalty records)
INSERT INTO
    `Loyalty` (`id`, `userId`, `points`, `updatedAt`)
VALUES
    (1, 3, 1500, NOW()),
    (2, 4, 2300, NOW()),
    (3, 5, 800, NOW()) ON DUPLICATE KEY
UPDATE `points` =
VALUES
    (`points`),
    `updatedAt` =
VALUES
    (`updatedAt`);

-- 5.13. SUPPORT TICKETS (3 support tickets)
INSERT INTO
    `SupportTicket` (
        `id`,
        `userEmail`,
        `subject`,
        `message`,
        `status`,
        `createdAt`
    )
VALUES
    (
        1,
        'user1@example.com',
        'Câu hỏi về tour',
        'Tôi muốn hỏi về tour Hạ Long, có thể đổi ngày không?',
        'open',
        DATE_SUB(NOW(), INTERVAL 3 DAY)
    ),
    (
        2,
        'user2@example.com',
        'Vấn đề thanh toán',
        'Tôi đã thanh toán nhưng chưa nhận được xác nhận',
        'closed',
        DATE_SUB(NOW(), INTERVAL 10 DAY)
    ),
    (
        3,
        'user3@example.com',
        'Yêu cầu hủy booking',
        'Tôi muốn hủy booking BK003',
        'open',
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    ) ON DUPLICATE KEY
UPDATE `status` =
VALUES
    (`status`),
    `message` =
VALUES
    (`message`);

-- 5.14. NEWSLETTER SUBSCRIPTIONS (5 subscriptions)
INSERT INTO
    `NewsletterSubscription` (
        `id`,
        `email`,
        `subscribed`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        'user1@example.com',
        1,
        DATE_SUB(NOW(), INTERVAL 30 DAY),
        NOW()
    ),
    (
        2,
        'user2@example.com',
        1,
        DATE_SUB(NOW(), INTERVAL 20 DAY),
        NOW()
    ),
    (
        3,
        'user3@example.com',
        1,
        DATE_SUB(NOW(), INTERVAL 15 DAY),
        NOW()
    ),
    (
        4,
        'newsletter@example.com',
        1,
        DATE_SUB(NOW(), INTERVAL 10 DAY),
        NOW()
    ),
    (
        5,
        'subscriber@example.com',
        0,
        DATE_SUB(NOW(), INTERVAL 5 DAY),
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ) ON DUPLICATE KEY
UPDATE `subscribed` =
VALUES
    (`subscribed`),
    `updatedAt` =
VALUES
    (`updatedAt`);

-- 5.15. CHAT SESSIONS (2 chat sessions)
INSERT INTO
    `ChatSession` (
        `id`,
        `userId`,
        `sessionId`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        3,
        'session_abc123',
        DATE_SUB(NOW(), INTERVAL 2 DAY),
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    ),
    (
        2,
        4,
        'session_xyz789',
        DATE_SUB(NOW(), INTERVAL 1 DAY),
        NOW()
    ) ON DUPLICATE KEY
UPDATE `updatedAt` =
VALUES
    (`updatedAt`);

-- 5.16. CHAT MESSAGES (6 chat messages)
INSERT INTO
    `ChatMessage` (`id`, `sessionId`, `role`, `content`, `createdAt`)
VALUES
    (
        1,
        1,
        'user',
        'Xin chào, tôi muốn hỏi về tour Hạ Long',
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ),
    (
        2,
        1,
        'assistant',
        'Chào bạn! Tôi có thể giúp bạn thông tin về tour Hạ Long. Tour này kéo dài 2 ngày 1 đêm với giá 3.200.000 VNĐ.',
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ),
    (
        3,
        1,
        'user',
        'Tour có bao gồm ăn uống không?',
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ),
    (
        4,
        1,
        'assistant',
        'Có, tour bao gồm 3 bữa ăn chính và 1 bữa sáng. Tất cả các bữa ăn đều là hải sản tươi sống.',
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ),
    (
        5,
        2,
        'user',
        'Tôi muốn đặt tour Phú Quốc',
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    ),
    (
        6,
        2,
        'assistant',
        'Tour Phú Quốc 3N2Đ có giá 5.200.000 VNĐ, bao gồm tham quan Nam đảo, VinWonders và VinSafari. Bạn có muốn đặt ngay không?',
        DATE_SUB(NOW(), INTERVAL 1 DAY)
    ) ON DUPLICATE KEY
UPDATE `content` =
VALUES
    (`content`);

-- 5.17. BOOKING TOURS (2 tour bookings)
INSERT INTO
    `BookingTour` (
        `id`,
        `tourId`,
        `userId`,
        `code`,
        `status`,
        `totalAmount`,
        `participants`,
        `date`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        1,
        3,
        'BT001',
        'CONFIRMED',
        6400000,
        2,
        DATE_ADD(NOW(), INTERVAL 7 DAY),
        DATE_SUB(NOW(), INTERVAL 5 DAY),
        DATE_SUB(NOW(), INTERVAL 5 DAY)
    ),
    (
        2,
        3,
        4,
        'BT002',
        'PENDING',
        5200000,
        1,
        DATE_ADD(NOW(), INTERVAL 14 DAY),
        DATE_SUB(NOW(), INTERVAL 2 DAY),
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ) ON DUPLICATE KEY
UPDATE `status` =
VALUES
    (`status`),
    `totalAmount` =
VALUES
    (`totalAmount`);

-- 5.18. PAYMENT TOURS (2 tour payments)
INSERT INTO
    `PaymentTour` (
        `id`,
        `bookingId`,
        `amount`,
        `status`,
        `provider`,
        `createdAt`,
        `updatedAt`
    )
VALUES
    (
        1,
        1,
        6400000,
        'SUCCESS',
        'VNPay',
        DATE_SUB(NOW(), INTERVAL 5 DAY),
        DATE_SUB(NOW(), INTERVAL 5 DAY)
    ),
    (
        2,
        2,
        5200000,
        'PENDING',
        'Momo',
        DATE_SUB(NOW(), INTERVAL 2 DAY),
        DATE_SUB(NOW(), INTERVAL 2 DAY)
    ) ON DUPLICATE KEY
UPDATE `status` =
VALUES
    (`status`),
    `amount` =
VALUES
    (`amount`);

-- 5.19. TOUR REVIEWS (3 tour reviews)
INSERT INTO
    `TourReview` (
        `id`,
        `tourId`,
        `userId`,
        `rating`,
        `comment`,
        `createdAt`
    )
VALUES
    (
        1,
        1,
        3,
        5,
        'Tour du thuyền Hạ Long rất tuyệt vời! Phòng view vịnh đẹp, hải sản tươi ngon. Nhân viên phục vụ chu đáo.',
        DATE_SUB(NOW(), INTERVAL 10 DAY)
    ),
    (
        2,
        2,
        4,
        4,
        'City tour Hà Nội giúp tôi hiểu thêm về lịch sử và văn hóa. Hướng dẫn viên nhiệt tình.',
        DATE_SUB(NOW(), INTERVAL 15 DAY)
    ),
    (
        3,
        3,
        5,
        5,
        'Phú Quốc đẹp quá! Tour bao gồm nhiều hoạt động thú vị. VinWonders và VinSafari rất đáng để tham quan.',
        DATE_SUB(NOW(), INTERVAL 20 DAY)
    ) ON DUPLICATE KEY
UPDATE `rating` =
VALUES
    (`rating`),
    `comment` =
VALUES
    (`comment`);

-- ============================================
-- PHẦN 6: HOÀN TẤT
-- ============================================
SELECT
    'Database created successfully!' AS message;

SELECT
    COUNT(*) as total_categories
FROM
    Category;

SELECT
    COUNT(*) as total_users
FROM
    User;

SELECT
    COUNT(*) as total_destinations
FROM
    Destination;

SELECT
    COUNT(*) as total_tours
FROM
    Tour;

SELECT
    COUNT(*) as total_hotels
FROM
    Hotel;

SELECT
    COUNT(*) as total_restaurants
FROM
    Restaurant;

SELECT
    COUNT(*) as total_reviews
FROM
    Review;

SELECT
    COUNT(*) as total_bookings
FROM
    Booking;

SELECT
    COUNT(*) as total_payments
FROM
    Payment;

SELECT
    COUNT(*) as total_wishlist
FROM
    Wishlist;

SELECT
    COUNT(*) as total_notifications
FROM
    Notification;

SELECT
    COUNT(*) as total_loyalty
FROM
    Loyalty;

SELECT
    COUNT(*) as total_support_tickets
FROM
    SupportTicket;

SELECT
    COUNT(*) as total_newsletter
FROM
    NewsletterSubscription;

SELECT
    COUNT(*) as total_chat_sessions
FROM
    ChatSession;

SELECT
    COUNT(*) as total_chat_messages
FROM
    ChatMessage;

SELECT
    COUNT(*) as total_booking_tours
FROM
    BookingTour;

SELECT
    COUNT(*) as total_payment_tours
FROM
    PaymentTour;

SELECT
    COUNT(*) as total_tour_reviews
FROM
    TourReview;

-- ============================================
-- PHẦN 7: MIGRATIONS - Thêm các cột và bảng bổ sung
-- ============================================
-- ============================================
-- 7.1: Thêm cột emailVerified vào bảng User
-- ============================================
SET
    @col_exists = 0;

SELECT
    COUNT(*) INTO @col_exists
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'travelgo'
    AND TABLE_NAME = 'User'
    AND COLUMN_NAME = 'emailVerified';

SET
    @sql = IF(
        @col_exists = 0,
        'ALTER TABLE `User` ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT FALSE AFTER `resetTokenExpiry`',
        'SELECT "Column emailVerified already exists" AS message'
    );

PREPARE stmt
FROM
    @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

UPDATE `User`
SET
    `emailVerified` = FALSE
WHERE
    `emailVerified` IS NULL;

-- ============================================
-- 7.2: Thêm các cột còn thiếu vào bảng User
-- ============================================
-- phoneVerified
SET
    @col_exists = 0;

SELECT
    COUNT(*) INTO @col_exists
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'travelgo'
    AND TABLE_NAME = 'User'
    AND COLUMN_NAME = 'phoneVerified';

SET
    @sql = IF(
        @col_exists = 0,
        'ALTER TABLE `User` ADD COLUMN `phoneVerified` BOOLEAN NOT NULL DEFAULT FALSE',
        'SELECT "Column phoneVerified already exists" AS message'
    );

PREPARE stmt
FROM
    @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

-- phoneVerificationCode
SET
    @col_exists = 0;

SELECT
    COUNT(*) INTO @col_exists
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'travelgo'
    AND TABLE_NAME = 'User'
    AND COLUMN_NAME = 'phoneVerificationCode';

SET
    @sql = IF(
        @col_exists = 0,
        'ALTER TABLE `User` ADD COLUMN `phoneVerificationCode` VARCHAR(191) NULL',
        'SELECT "Column phoneVerificationCode already exists" AS message'
    );

PREPARE stmt
FROM
    @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

-- phoneVerificationExpiry
SET
    @col_exists = 0;

SELECT
    COUNT(*) INTO @col_exists
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'travelgo'
    AND TABLE_NAME = 'User'
    AND COLUMN_NAME = 'phoneVerificationExpiry';

SET
    @sql = IF(
        @col_exists = 0,
        'ALTER TABLE `User` ADD COLUMN `phoneVerificationExpiry` DATETIME(3) NULL',
        'SELECT "Column phoneVerificationExpiry already exists" AS message'
    );

PREPARE stmt
FROM
    @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

-- dateOfBirth
SET
    @col_exists = 0;

SELECT
    COUNT(*) INTO @col_exists
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'travelgo'
    AND TABLE_NAME = 'User'
    AND COLUMN_NAME = 'dateOfBirth';

SET
    @sql = IF(
        @col_exists = 0,
        'ALTER TABLE `User` ADD COLUMN `dateOfBirth` DATETIME(3) NULL',
        'SELECT "Column dateOfBirth already exists" AS message'
    );

PREPARE stmt
FROM
    @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

-- twoFactorEnabled
SET
    @col_exists = 0;

SELECT
    COUNT(*) INTO @col_exists
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'travelgo'
    AND TABLE_NAME = 'User'
    AND COLUMN_NAME = 'twoFactorEnabled';

SET
    @sql = IF(
        @col_exists = 0,
        'ALTER TABLE `User` ADD COLUMN `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT FALSE',
        'SELECT "Column twoFactorEnabled already exists" AS message'
    );

PREPARE stmt
FROM
    @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

-- twoFactorSecret
SET
    @col_exists = 0;

SELECT
    COUNT(*) INTO @col_exists
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'travelgo'
    AND TABLE_NAME = 'User'
    AND COLUMN_NAME = 'twoFactorSecret';

SET
    @sql = IF(
        @col_exists = 0,
        'ALTER TABLE `User` ADD COLUMN `twoFactorSecret` VARCHAR(191) NULL',
        'SELECT "Column twoFactorSecret already exists" AS message'
    );

PREPARE stmt
FROM
    @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

-- pushSubscription
SET
    @col_exists = 0;

SELECT
    COUNT(*) INTO @col_exists
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'travelgo'
    AND TABLE_NAME = 'User'
    AND COLUMN_NAME = 'pushSubscription';

SET
    @sql = IF(
        @col_exists = 0,
        'ALTER TABLE `User` ADD COLUMN `pushSubscription` JSON NULL',
        'SELECT "Column pushSubscription already exists" AS message'
    );

PREPARE stmt
FROM
    @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

-- verificationToken và verificationTokenExpiry (nếu chưa có)
SET
    @col_exists = 0;

SELECT
    COUNT(*) INTO @col_exists
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'travelgo'
    AND TABLE_NAME = 'User'
    AND COLUMN_NAME = 'verificationToken';

SET
    @sql = IF(
        @col_exists = 0,
        'ALTER TABLE `User` ADD COLUMN `verificationToken` VARCHAR(191) NULL AFTER `emailVerified`',
        'SELECT "Column verificationToken already exists" AS message'
    );

PREPARE stmt
FROM
    @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

SET
    @col_exists = 0;

SELECT
    COUNT(*) INTO @col_exists
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = 'travelgo'
    AND TABLE_NAME = 'User'
    AND COLUMN_NAME = 'verificationTokenExpiry';

SET
    @sql = IF(
        @col_exists = 0,
        'ALTER TABLE `User` ADD COLUMN `verificationTokenExpiry` DATETIME(3) NULL AFTER `verificationToken`',
        'SELECT "Column verificationTokenExpiry already exists" AS message'
    );

PREPARE stmt
FROM
    @sql;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

-- ============================================
-- 7.3: Tạo bảng PromoCode và PromoCodeUsage
-- ============================================
CREATE TABLE IF NOT EXISTS
    `PromoCode` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `code` VARCHAR(255) NOT NULL UNIQUE,
        `description` TEXT,
        `discountType` VARCHAR(50) NOT NULL DEFAULT 'PERCENTAGE',
        `discountValue` INT NOT NULL,
        `minAmount` INT NOT NULL DEFAULT 0,
        `maxDiscount` INT,
        `usageLimit` INT,
        `usedCount` INT NOT NULL DEFAULT 0,
        `validFrom` DATETIME NOT NULL,
        `validUntil` DATETIME NOT NULL,
        `active` BOOLEAN NOT NULL DEFAULT TRUE,
        `applicableTo` JSON,
        `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        INDEX `idx_code` (`code`),
        INDEX `idx_active` (`active`),
        INDEX `idx_valid_dates` (`validFrom`, `validUntil`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS
    `PromoCodeUsage` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `promoCodeId` INT NOT NULL,
        `userId` INT,
        `bookingId` INT,
        `amount` INT NOT NULL,
        `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        FOREIGN KEY (`promoCodeId`) REFERENCES `PromoCode` (`id`) ON DELETE CASCADE,
        FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL,
        INDEX `idx_promo_code` (`promoCodeId`),
        INDEX `idx_user` (`userId`),
        INDEX `idx_booking` (`bookingId`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================
-- PHẦN 6: HOÀN TẤT (Updated)
-- ============================================
SELECT
    '✅ All migrations completed successfully!' AS migration_status;