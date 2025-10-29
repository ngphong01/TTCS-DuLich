# MySQL Setup Guide

## 🚀 Quick Start

### 1. Install MySQL

```bash
# Windows (using Chocolatey)
choco install mysql

# macOS (using Homebrew)
brew install mysql

# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server
```

### 2. Configure Environment

Create `.env.local` file:

```env
DATABASE_URL="mysql://username:password@localhost:3306/nextjs_starter"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. Setup Database

```bash
# Run MySQL setup script
npm run mysql:setup

# Or run migration script
npm run mysql:migrate

# Or optimize everything
npm run mysql:optimize
```

## 🔧 Configuration Options

### Basic MySQL Connection

```env
DATABASE_URL="mysql://root:password@localhost:3306/nextjs_starter"
```

### With SSL (Production)

```env
DATABASE_URL="mysql://user:pass@host:3306/db?ssl=true"
```

### With Connection Pooling

```env
DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=5&pool_timeout=20"
```

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if MySQL server is running
   - Verify host and port (default: localhost:3306)
   - Check firewall settings

2. **Authentication Failed**
   - Verify username and password
   - Check MySQL user permissions
   - Ensure user can access the database

3. **Database Not Found**
   - Create database manually: `CREATE DATABASE nextjs_starter;`
   - Or let the setup script create it automatically

4. **Character Set Issues**
   - Ensure MySQL uses utf8mb4 character set
   - Check collation settings

### Performance Optimization

1. **Indexes**
   - The schema includes optimized indexes for common queries
   - Run `npm run mysql:optimize` to add performance indexes

2. **Connection Pooling**
   - Use connection pooling for better performance
   - Adjust pool size based on your needs

3. **Query Optimization**
   - Use `EXPLAIN` to analyze slow queries
   - Monitor query performance with MySQL tools

## 📊 Monitoring

### Check Database Status

```bash
# Check MySQL service status
sudo systemctl status mysql

# Connect to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Show tables
USE nextjs_starter;
SHOW TABLES;
```

### Performance Monitoring

```bash
# Show process list
SHOW PROCESSLIST;

# Show variables
SHOW VARIABLES LIKE '%connection%';

# Show status
SHOW STATUS LIKE '%connections%';
```

## 🔒 Security Best Practices

1. **Use Strong Passwords**
   - Generate secure passwords for database users
   - Use different passwords for different environments

2. **Limit User Permissions**
   - Create specific users for your application
   - Grant only necessary permissions

3. **Enable SSL**
   - Use SSL connections in production
   - Configure SSL certificates properly

4. **Regular Backups**
   - Set up automated database backups
   - Test backup restoration procedures

## 🚀 Production Deployment

### Environment Variables

```env
# Production
DATABASE_URL="mysql://prod_user:secure_password@prod_host:3306/prod_db?ssl=true&connection_limit=10"

# Staging
DATABASE_URL="mysql://staging_user:staging_password@staging_host:3306/staging_db?ssl=true"

# Development
DATABASE_URL="mysql://dev_user:dev_password@localhost:3306/dev_db"
```

### Docker Setup

```yaml
# docker-compose.yml
version: "3.8"
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: nextjs_starter
      MYSQL_USER: app_user
      MYSQL_PASSWORD: app_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## 📝 Migration from SQLite

If you're migrating from SQLite:

1. **Export SQLite Data**

   ```bash
   sqlite3 prisma/database.db ".dump" > sqlite_export.sql
   ```

2. **Convert to MySQL Format**
   - Replace `INTEGER PRIMARY KEY` with `AUTO_INCREMENT`
   - Replace `TEXT` with `VARCHAR` or `TEXT`
   - Remove SQLite-specific syntax

3. **Import to MySQL**
   ```bash
   mysql -u username -p database_name < converted_dump.sql
   ```

## 🎯 Next Steps

1. Run `npm run mysql:setup` to initialize your MySQL database
2. Test your application with `npm run dev`
3. Monitor performance and optimize as needed
4. Set up production database with proper security measures

For more help, check the MySQL documentation or contact support.
