# Database Configuration

## Current Setup: Supabase (PostgreSQL)

This project is **currently configured to use Supabase** (PostgreSQL) which provides:
- Pre-provisioned database instance
- Row Level Security (RLS)
- Real-time subscriptions
- Built-in authentication
- MCP tools integration

Connection details are available in `.env` file.

## Alternative: MySQL Setup

If you prefer to use MySQL for local development, follow these steps:

### 1. Install MySQL

**macOS (using Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

**Windows:**
Download and install from [MySQL Official Website](https://dev.mysql.com/downloads/mysql/)

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.mysql.example .env.local
```

Edit `.env.local` with your MySQL credentials.

### 3. Install MySQL Node.js Driver

```bash
npm install mysql2
```

### 4. Initialize Database

Run the schema migration:
```bash
mysql -u root -p < DATABASE_SCHEMA_TEST_DATA.sql
```

Or create the database and import:
```bash
mysql -u root -p
CREATE DATABASE oldroad_auto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE oldroad_auto;
source DATABASE_SCHEMA_TEST_DATA.sql;
```

### 5. Test Connection

Create a test file:
```javascript
import { testConnection } from './database/mysql.config.js';
testConnection();
```

## Database Schema

The database schema is defined in `DATABASE_SCHEMA_TEST_DATA.sql` and includes:

- **locations** - Showroom and warehouse locations
- **users** - User accounts and staff
- **vehicles** - Vehicle inventory
- **contracts** - Sales contracts
- **transactions** - Financial transactions
- **invoices** - Customer invoices
- **vendor_bills** - Supplier bills
- **bank_accounts** - Bank account tracking
- **chart_of_accounts** - Accounting ledger
- **contact_entities** - Customers and vendors
- **trade_requests** - Trade-in requests
- **budgets** - Budget planning

## Recommended: Use Supabase

For the best experience with this application, we recommend using **Supabase** (already configured) because:

✓ No local database setup required
✓ Built-in authentication
✓ Row Level Security for data protection
✓ Real-time capabilities
✓ Automatic backups
✓ MCP tools integration
✓ Production-ready from day one

To use Supabase, simply use the existing `.env` configuration and the `mcp__supabase__*` tools.
