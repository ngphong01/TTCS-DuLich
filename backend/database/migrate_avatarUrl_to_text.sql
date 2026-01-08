-- Migration: Change avatarUrl column from VARCHAR(191) to TEXT
-- This allows longer URLs from OAuth providers (Google, Facebook, etc.)

ALTER TABLE `User` 
MODIFY COLUMN `avatarUrl` TEXT NULL;

-- Verify the change
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'User' 
AND COLUMN_NAME = 'avatarUrl';

