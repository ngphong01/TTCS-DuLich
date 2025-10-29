# MySQL Setup Instructions

## 🚀 Quick Setup for Your Machine

### Step 1: Install MySQL

Choose one of these options:

#### Option A: XAMPP (Easiest)

1. Download XAMPP: https://www.apachefriends.org/download.html
2. Install and start MySQL from XAMPP Control Panel
3. Default settings: username=`root`, password=`` (empty)

#### Option B: MySQL Community Server

1. Download: https://dev.mysql.com/downloads/mysql/
2. Install with root password of your choice
3. Start MySQL service

#### Option C: Docker

```bash
docker run --name mysql-db -e MYSQL_ROOT_PASSWORD=yourpassword -p 3306:3306 -d mysql:8.0
```

### Step 2: Create Environment File

Create `.env.local` file in your project root:

```env
# Replace with your actual MySQL credentials
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/travelgo"

# Other required variables
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### Step 3: Test Connection

```bash
node scripts/mysql-test.mjs
```

### Step 4: Setup Database

```bash
npm run mysql:setup
```

### Step 5: Start Application

```bash
npm run dev
```

## 🔧 Common MySQL Credentials

### XAMPP Default

- Username: `root`
- Password: `` (empty)
- Port: `3306`

### MySQL Community Server

- Username: `root`
- Password: `[your chosen password]`
- Port: `3306`

### Docker MySQL

- Username: `root`
- Password: `[password you set]`
- Port: `3306`

## 📋 What You Need to Provide

Please provide:

1. **MySQL Username** (usually `root`)
2. **MySQL Password** (your chosen password)
3. **MySQL Port** (usually `3306`)
4. **Database Name** (suggested: `travelgo`)

## 🚀 Ready to Connect

Once you have MySQL running, I can help you:

1. Test the connection
2. Create the database
3. Run migrations
4. Start your application

Just let me know your MySQL credentials!
