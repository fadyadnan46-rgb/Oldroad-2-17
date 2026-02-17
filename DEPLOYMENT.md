# Deployment Guide

## Server Requirements

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **MySQL**: v8.0 or higher
- **Operating System**: Ubuntu 20.04+, CentOS 8+, or similar
- **RAM**: Minimum 2GB
- **Storage**: Minimum 5GB

## Step 1: Prepare Your Server

### Ubuntu/Debian Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20 LTS recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL Server
sudo apt install -y mysql-server

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Verify installations
node --version
npm --version
mysql --version
```

### CentOS/RHEL Setup

```bash
# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Install MySQL
sudo yum install -y mysql-server

# Start MySQL service
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Verify installations
node --version
npm --version
mysql --version
```

## Step 2: Set Up MySQL Database

```bash
# Connect to MySQL as root
sudo mysql -u root

# Run these commands in MySQL:
CREATE DATABASE oldroad_auto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'oldroad_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';

GRANT ALL PRIVILEGES ON oldroad_auto.* TO 'oldroad_user'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

### Import Database Schema

```bash
# Copy your schema file to the server
scp DATABASE_SCHEMA_TEST_DATA.sql user@your-server:/home/user/

# Import schema
mysql -u oldroad_user -p oldroad_auto < DATABASE_SCHEMA_TEST_DATA.sql
```

## Step 3: Deploy Application

### Clone or Transfer Project

```bash
# Option A: Clone from repository (if using Git)
cd /var/www
sudo git clone your-repository-url oldroad-auto
cd oldroad-auto

# Option B: Transfer files via SCP
scp -r /path/to/local/project user@your-server:/var/www/oldroad-auto
```

### Install Dependencies

```bash
cd /var/www/oldroad-auto
npm install
```

### Configure Environment Variables

```bash
# Copy MySQL environment template
cp .env.mysql.example .env

# Edit environment variables
nano .env
```

Update `.env` with your server details:

```env
MYSQL_HOST=localhost
MYSQL_USER=oldroad_user
MYSQL_PASSWORD=your_secure_password_here
MYSQL_DATABASE=oldroad_auto
MYSQL_PORT=3306

NODE_ENV=production
PORT=5173
```

## Step 4: Build Application

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Step 5: Set Up Process Manager (PM2)

### Install PM2

```bash
sudo npm install -g pm2
```

### Create PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'oldroad-auto',
      script: 'npm',
      args: 'run dev',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

### Start Application with PM2

```bash
# Create logs directory
mkdir -p logs

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Enable PM2 startup on reboot
pm2 startup systemd -u $USER --hp /home/$USER
```

## Step 6: Set Up Nginx Reverse Proxy

### Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Configure Nginx

Create `/etc/nginx/sites-available/oldroad-auto`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS (recommended for production)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (use Let's Encrypt or your certificate)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Enable Nginx Site

```bash
sudo ln -s /etc/nginx/sites-available/oldroad-auto /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Set Up SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (already enabled by default)
sudo systemctl start certbot.timer
sudo systemctl enable certbot.timer
```

## Step 7: Database Backups

### Create Backup Script

Create `/home/user/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/home/user/db-backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="oldroad_auto_${DATE}.sql.gz"

mkdir -p $BACKUP_DIR

mysqldump -u oldroad_user -p'your_secure_password_here' oldroad_auto | gzip > $BACKUP_DIR/$FILENAME

# Keep only last 7 days of backups
find $BACKUP_DIR -name "oldroad_auto_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $FILENAME"
```

### Schedule Daily Backups

```bash
# Make script executable
chmod +x /home/user/backup-db.sh

# Add to crontab
crontab -e

# Add this line (runs daily at 2 AM):
0 2 * * * /home/user/backup-db.sh >> /var/log/oldroad-backup.log 2>&1
```

## Step 8: Monitoring & Logs

### View Application Logs

```bash
# Real-time logs
pm2 logs oldroad-auto

# View specific log file
tail -f logs/out.log
tail -f logs/error.log
```

### Monitor with PM2

```bash
# Monitor dashboard
pm2 monit

# List running processes
pm2 list

# Restart application
pm2 restart oldroad-auto

# Stop application
pm2 stop oldroad-auto

# Start application
pm2 start oldroad-auto
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs oldroad-auto

# Verify environment variables
cat .env

# Check MySQL connection
mysql -u oldroad_user -p oldroad_auto -e "SELECT 1;"
```

### Database Connection Issues

```bash
# Test MySQL connection
mysql -h localhost -u oldroad_user -p -e "USE oldroad_auto; SHOW TABLES;"

# Check MySQL is running
sudo systemctl status mysql

# Restart MySQL if needed
sudo systemctl restart mysql
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :5173

# Kill process (if needed)
sudo kill -9 <PID>
```

## Production Recommendations

1. **Use HTTPS**: Always use SSL/TLS certificates
2. **Firewall**: Configure UFW to allow only necessary ports
3. **Database**: Use strong passwords and limit user privileges
4. **Backups**: Automate daily database backups
5. **Monitoring**: Set up alerts for application/database failures
6. **Updates**: Keep Node.js, MySQL, and OS packages updated
7. **Secrets**: Never commit `.env` files to version control

## Quick Start Summary

```bash
# 1. SSH into server
ssh user@your-server

# 2. Set up database
sudo mysql -u root < setup-database.sql

# 3. Deploy application
cd /var/www/oldroad-auto
npm install && npm run build

# 4. Start with PM2
pm2 start ecosystem.config.js

# 5. Configure Nginx and SSL
# (Follow Nginx section above)
```

## Alternative: Use Supabase (Recommended)

For easier deployment without local database management, consider using **Supabase**:

- No database server maintenance
- Built-in authentication
- Automatic backups
- Real-time capabilities
- Production-ready from day one

Switch by updating your `.env` to use Supabase connection details instead of MySQL.
