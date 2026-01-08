#!/bin/bash

# Script setup database cho TravelGo
# Usage: ./scripts/setup-database.sh [mysql_user] [mysql_password]

set -e

MYSQL_USER=${1:-root}
MYSQL_PASSWORD=${2:-123456}
DB_NAME="travelgo"

echo "🚀 TravelGo Database Setup"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MySQL is running
echo "📋 Checking MySQL connection..."
if ! mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}❌ Cannot connect to MySQL. Please check:${NC}"
    echo "   - MySQL is running"
    echo "   - Username and password are correct"
    echo "   - User has CREATE DATABASE permission"
    exit 1
fi
echo -e "${GREEN}✅ MySQL connection OK${NC}"
echo ""

# Create database
echo "📦 Creating database '$DB_NAME'..."
mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || {
    echo -e "${RED}❌ Failed to create database${NC}"
    exit 1
}
echo -e "${GREEN}✅ Database created${NC}"
echo ""

# Import SQL file
if [ -f "database/travelgo_complete.sql" ]; then
    echo "📥 Importing database from travelgo_complete.sql..."
    mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$DB_NAME" < database/travelgo_complete.sql || {
        echo -e "${RED}❌ Failed to import SQL file${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Database imported successfully${NC}"
    echo ""
    
    # Import extended data if exists
    if [ -f "database/travelgo_extended_data.sql" ]; then
        echo "📥 Importing extended data..."
        mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$DB_NAME" < database/travelgo_extended_data.sql || {
            echo -e "${YELLOW}⚠️  Extended data import had issues (may already exist)${NC}"
        }
        echo -e "${GREEN}✅ Extended data imported${NC}"
        echo ""
    fi
else
    echo -e "${YELLOW}⚠️  SQL file not found. Using Prisma migrate instead...${NC}"
    echo ""
    
    # Use Prisma
    echo "📦 Running Prisma migrations..."
    npm run prisma:migrate || {
        echo -e "${RED}❌ Prisma migrate failed${NC}"
        exit 1
    }
    
    echo "🌱 Running Prisma seed..."
    npm run prisma:seed || {
        echo -e "${YELLOW}⚠️  Seed had issues (may already exist)${NC}"
    }
fi

# Verify data
echo "🔍 Verifying database..."
DEST_COUNT=$(mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$DB_NAME" -se "SELECT COUNT(*) FROM Destination;" 2>/dev/null || echo "0")
TOUR_COUNT=$(mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$DB_NAME" -se "SELECT COUNT(*) FROM Tour;" 2>/dev/null || echo "0")
HOTEL_COUNT=$(mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$DB_NAME" -se "SELECT COUNT(*) FROM Hotel;" 2>/dev/null || echo "0")
RESTAURANT_COUNT=$(mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -D "$DB_NAME" -se "SELECT COUNT(*) FROM Restaurant;" 2>/dev/null || echo "0")

echo ""
echo "📊 Database Statistics:"
echo "   - Destinations: $DEST_COUNT"
echo "   - Tours: $TOUR_COUNT"
echo "   - Hotels: $HOTEL_COUNT"
echo "   - Restaurants: $RESTAURANT_COUNT"
echo ""

if [ "$DEST_COUNT" -gt "0" ]; then
    echo -e "${GREEN}✅ Database setup completed successfully!${NC}"
    echo ""
    echo "🔑 Admin Accounts:"
    echo "   Email: admin@travelgo.dev"
    echo "   Password: admin123"
    echo ""
    echo "   Email: phong@triennguyen.com"
    echo "   Password: Phong@2004"
else
    echo -e "${YELLOW}⚠️  Database created but may be empty. Run seed manually:${NC}"
    echo "   npm run prisma:seed"
fi

echo ""
echo "🎉 Setup complete! You can now start the application:"
echo "   npm run dev:all"

