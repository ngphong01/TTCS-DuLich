-- Add language column to User table for i18n support
-- BCP-47 language codes: en, vi, fr, ja, ko, zh-CN, zh-TW, de, es, th, etc.

USE travelgo;

-- Check if column exists before adding
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'User' 
  AND COLUMN_NAME = 'language'
);

SET @sql = IF(
  @column_exists = 0,
  'ALTER TABLE User ADD COLUMN language VARCHAR(10) DEFAULT ''en'' AFTER pushSubscription',
  'SELECT ''Language column already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing users to have default language
UPDATE User SET language = 'en' WHERE language IS NULL;

-- Verify
SELECT '✅ Language column added successfully' AS status;
SELECT COUNT(*) AS users_with_language FROM User WHERE language IS NOT NULL;

