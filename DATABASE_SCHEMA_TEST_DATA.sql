-- =====================================================
-- OldRoad Auto - Database Schema & Test Data
-- =====================================================

-- =====================================================
-- 1. LOCATIONS TABLE
-- =====================================================
CREATE TABLE locations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  type VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO locations (id, name, address, type, phone, email) VALUES
('loc1', 'Main Showroom', '123 Auto Row, Toronto, ON', 'Showroom', '555-0100', 'sales@oldroad.auto'),
('loc2', 'East Warehouse', '456 Industrial Pkwy, Oshawa, ON', 'Warehouse', '555-0200', 'storage@oldroad.auto');

-- =====================================================
-- 2. USERS TABLE
-- =====================================================
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role ENUM('CUSTOMER', 'SALES', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  location VARCHAR(255),
  base_salary DECIMAL(10, 2),
  hire_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO users (id, email, first_name, last_name, role, base_salary, hire_date) VALUES
('u1', 'admin@oldroad.auto', 'Master', 'Admin', 'ADMIN', 8500.00, '2012-05-15'),
('u2', 'sales@oldroad.auto', 'John', 'Seller', 'SALES', 4500.00, '2021-11-01'),
('u3', 'customer@gmail.com', 'Jane', 'Doe', 'CUSTOMER', NULL, NULL);

-- =====================================================
-- 3. VEHICLES TABLE
-- =====================================================
CREATE TABLE vehicles (
  id VARCHAR(50) PRIMARY KEY,
  vin VARCHAR(50) UNIQUE NOT NULL,
  year INT NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  trim VARCHAR(100),
  color VARCHAR(100),
  body_style VARCHAR(100),
  fuel_type ENUM('Gas', 'Hybrid', 'EV', 'Other') DEFAULT 'Gas',
  km INT,
  price DECIMAL(10, 2),
  status ENUM('New', 'Working on it', 'Ready', 'Sold') DEFAULT 'New',
  ribbon VARCHAR(50),
  location VARCHAR(255),
  transmission VARCHAR(100),
  engine VARCHAR(100),
  drivetrain VARCHAR(50),
  carfax_url VARCHAR(500),
  is_carfax_one_owner BOOLEAN,
  sold_by_id VARCHAR(50),
  sale_date DATE,
  buyer_name VARCHAR(255),
  buyer_email VARCHAR(255),
  buyer_phone VARCHAR(20),
  sale_price DECIMAL(10, 2),
  ready_to_sell_date DATE,
  contract_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location) REFERENCES locations(id),
  FOREIGN KEY (sold_by_id) REFERENCES users(id)
);

-- Insert test data
INSERT INTO vehicles (id, vin, year, make, model, trim, color, body_style, fuel_type, km, price, status, ribbon, location, transmission, engine, drivetrain, carfax_url, is_carfax_one_owner) VALUES
('v1', '1GKS2CKC6LR123456', 2009, 'Porsche', 'Boxster Base', 'Convertible', 'Guards Red', 'Convertible', 'Gas', 5200, 44995.00, 'Ready', 'Just Arrived', 'loc1', '6-Speed Manual', '2.7L Straight Six', 'RWD', 'https://www.carfax.com/demo', 1),
('v2', '2T3P1RFV5MW654321', 2009, 'Porsche', 'Boxster Base', 'Red Convertible', 'Red', 'Convertible', 'Gas', 126273, 19995.00, 'Ready', 'Clearout', 'loc1', '5-Speed Manual', '2.9L Mid-Engine', 'RWD', 'https://www.carfax.com/demo', 1),
('v3', 'PORSCHE-SOLD-123', 2012, 'Porsche', 'Boxster S', 'Convertible', 'Carrara White', 'Convertible', 'Gas', 23000, 48100.00, 'Sold', NULL, 'loc1', '6-Speed Manual', '2.7L Straight Six', 'RWD', 'https://www.carfax.com/demo', 1),
('v4', 'TURBO-INV-999', 2009, 'Porsche', 'Carrera 4S Turbo', 'Convertible', 'Racing Yellow', 'Convertible', 'Gas', 15000, 125000.00, 'Ready', NULL, 'loc2', 'PDK Dual-Clutch', '3.8L Flat Six', 'AWD', NULL, 0);

-- =====================================================
-- 4. CONTACT ENTITIES TABLE
-- =====================================================
CREATE TABLE contact_entities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category ENUM('Vendor', 'Customer', 'Logistics / Transport', 'Utility Provider', 'Government / Tax', 'Other'),
  email VARCHAR(255),
  phone VARCHAR(20),
  address VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO contact_entities (id, name, category, email, phone, address) VALUES
('ent-1', 'Copart Auctions', 'Vendor', 'billing@copart.com', '1-800-COPART', 'Dallas, TX'),
('ent-2', 'Elite Detailing', 'Vendor', 'service@elitedetailing.ca', '416-555-0122', 'Scarborough, ON'),
('ent-3', 'Quick Tow Logistics', 'Logistics / Transport', 'dispatch@quicktow.ca', '905-555-8899', 'Mississauga, ON'),
('ent-4', 'Hydro One', 'Utility Provider', 'business@hydroone.com', '1-888-664-9376', NULL),
('ent-5', 'Jane Doe', 'Customer', 'jane.doe@gmail.com', NULL, NULL);

-- =====================================================
-- 5. CHART OF ACCOUNTS TABLE
-- =====================================================
CREATE TABLE chart_of_accounts (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense'),
  balance DECIMAL(12, 2) DEFAULT 0,
  description VARCHAR(500),
  is_locked BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO chart_of_accounts (code, name, type, balance, description) VALUES
('1010', 'Cash at Bank', 'Asset', 450000.00, 'Primary operating funds'),
('1200', 'Accounts Receivable', 'Asset', 125000.00, 'Unpaid customer invoices'),
('1400', 'Vehicle Inventory', 'Asset', 2450000.00, 'Capitalized cost of cars'),
('2100', 'Accounts Payable', 'Liability', 85000.00, 'Unpaid vendor bills'),
('2300', 'VAT Payable/Receivable', 'Liability', 12400.00, 'Tax liability tracker'),
('3000', 'Retained Earnings', 'Equity', 1800000.00, 'Accumulated profits'),
('4000', 'Vehicle Sales Revenue', 'Revenue', 820000.00, 'Gross income from sales'),
('5100', 'Cost of Goods Sold', 'Expense', 640000.00, 'Original car acquisition costs'),
('6200', 'Staff Salaries', 'Expense', 145000.00, 'Wages and benefits');

-- =====================================================
-- 6. TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE transactions (
  id VARCHAR(50) PRIMARY KEY,
  posting_date DATE NOT NULL,
  invoice_date DATE,
  system_entry_date DATE,
  type ENUM('INCOME', 'EXPENSE') NOT NULL,
  category VARCHAR(100),
  amount DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(10, 2),
  description VARCHAR(500),
  location_id VARCHAR(50),
  reference_id VARCHAR(50),
  account_code VARCHAR(20),
  period_id VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id),
  FOREIGN KEY (account_code) REFERENCES chart_of_accounts(code)
);

-- Insert test data
INSERT INTO transactions (id, posting_date, invoice_date, system_entry_date, type, category, amount, tax_amount, description, location_id, reference_id, account_code, period_id) VALUES
('t1', '2025-01-10', '2025-01-08', '2025-01-10', 'EXPENSE', 'Vehicle Purchase', 72000.00, 0.00, 'Initial purchase from Auction', 'loc2', 'v1', '5100', '2025-01'),
('t3', '2025-02-01', '2025-01-31', '2025-02-01', 'EXPENSE', 'Employee Salary', 5500.00, 0.00, 'Monthly Salary - John Seller', 'loc1', 'u2', '6200', '2025-02'),
('t5', '2025-02-15', '2025-02-15', '2025-02-15', 'INCOME', 'Vehicle Sale', 58000.00, 7540.00, 'Final Sale to Jane Doe', 'loc1', 'v-sold-1', '4000', '2025-02');

-- =====================================================
-- 7. INVOICES TABLE
-- =====================================================
CREATE TABLE invoices (
  id VARCHAR(50) PRIMARY KEY,
  date DATE NOT NULL,
  due_date DATE,
  customer_id VARCHAR(50),
  customer_name VARCHAR(255),
  amount DECIMAL(12, 2),
  tax_amount DECIMAL(10, 2),
  status ENUM('Draft', 'Sent', 'Paid', 'Overdue') DEFAULT 'Draft',
  reference_id VARCHAR(50),
  down_payment DECIMAL(12, 2),
  installments_total INT,
  installments_paid INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES contact_entities(id)
);

-- Insert test data
INSERT INTO invoices (id, date, due_date, customer_id, customer_name, amount, tax_amount, status, reference_id) VALUES
('INV-2025-001', '2025-02-10', '2025-02-24', 'ent-5', 'Jane Doe', 58000.00, 7540.00, 'Paid', 'v-sold-1'),
('INV-2025-002', '2025-02-15', '2025-03-01', 'ent-5', 'Robert Smith', 92000.00, 11960.00, 'Sent', 'v1');

-- =====================================================
-- 8. VENDOR BILLS TABLE
-- =====================================================
CREATE TABLE vendor_bills (
  id VARCHAR(50) PRIMARY KEY,
  bill_number VARCHAR(100),
  posting_date DATE,
  invoice_date DATE,
  system_entry_date DATE,
  due_date DATE,
  vendor_name VARCHAR(255),
  vendor_type ENUM('Auction', 'Shipping', 'Customs', 'Repair Shop', 'Utilities'),
  amount DECIMAL(12, 2),
  tax_amount DECIMAL(10, 2),
  status ENUM('Draft', 'Pending', 'Paid', 'Overdue') DEFAULT 'Draft',
  category VARCHAR(100),
  reference_id VARCHAR(50),
  is_shared_expense BOOLEAN DEFAULT 0,
  allocation_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO vendor_bills (id, bill_number, posting_date, invoice_date, system_entry_date, due_date, vendor_name, vendor_type, amount, tax_amount, status, category, reference_id, is_shared_expense) VALUES
('BILL-001', 'CP-88291', '2025-02-01', '2025-02-01', '2025-02-01', '2025-02-15', 'Copart Auctions', 'Auction', 72000.00, 0.00, 'Paid', 'Vehicle Purchase', 'v1', 0),
('BILL-002', 'ED-452', '2025-02-12', '2025-02-12', '2025-02-12', '2025-02-26', 'Elite Detailing', 'Repair Shop', 450.00, 58.50, 'Pending', 'Detailing', 'v2', 0),
('BILL-003', 'HY-FEB25', '2025-02-14', '2025-02-14', '2025-02-14', '2025-03-14', 'Hydro One', 'Utilities', 2400.00, 312.00, 'Pending', 'Operating Expense', NULL, 1);

-- =====================================================
-- 9. BANK ACCOUNTS TABLE
-- =====================================================
CREATE TABLE bank_accounts (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  institution VARCHAR(255),
  account_number VARCHAR(50),
  balance DECIMAL(12, 2),
  type ENUM('Checking', 'Savings', 'Money Market') DEFAULT 'Checking',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO bank_accounts (id, name, institution, account_number, balance, type) VALUES
('bank1', 'TD Business Operating', 'TD Canada Trust', '****5582', 342000.00, 'Checking'),
('bank2', 'GCP High-Interest Savings', 'GCP Bank', '****1102', 1200000.00, 'Savings');

-- =====================================================
-- 10. CONTRACTS TABLE
-- =====================================================
CREATE TABLE contracts (
  id VARCHAR(50) PRIMARY KEY,
  contract_number VARCHAR(100),
  vehicle_id VARCHAR(50),
  buyer_name VARCHAR(255),
  buyer_email VARCHAR(255),
  buyer_phone VARCHAR(20),
  sale_price DECIMAL(12, 2),
  sale_date DATE,
  status ENUM('Draft', 'Finalized', 'Canceled') DEFAULT 'Draft',
  created_by VARCHAR(50),
  created_date TIMESTAMP,
  last_edited_by VARCHAR(50),
  last_edited_date TIMESTAMP,
  canceled_by VARCHAR(50),
  canceled_date DATE,
  cancel_reason VARCHAR(500),
  notes VARCHAR(1000),
  vehicle_vin VARCHAR(50),
  vehicle_year INT,
  vehicle_make VARCHAR(100),
  vehicle_model VARCHAR(100),
  vehicle_trim VARCHAR(100),
  vehicle_color VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Insert test data
INSERT INTO contracts (id, contract_number, vehicle_id, buyer_name, buyer_email, buyer_phone, sale_price, sale_date, status, created_by, created_date, notes, vehicle_vin, vehicle_year, vehicle_make, vehicle_model, vehicle_trim, vehicle_color) VALUES
('contract-1', 'OR-2025-00001', 'v1', 'John Smith', 'john.smith@example.com', '(416) 555-0123', 42500.00, '2025-02-15', 'Finalized', 'u2', '2025-02-15 10:30:00', 'Premium vehicle, excellent condition', '9BWDB4445X1000001', 2021, 'Porsche', '911 Carrera', 'Base', 'Racing Yellow');

-- =====================================================
-- 11. TRADE REQUESTS TABLE
-- =====================================================
CREATE TABLE trade_requests (
  id VARCHAR(50) PRIMARY KEY,
  customer_id VARCHAR(50),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  vin VARCHAR(50),
  year INT,
  make VARCHAR(100),
  model VARCHAR(100),
  km INT,
  condition VARCHAR(1000),
  status ENUM('Pending', 'Accepted', 'Rejected', 'Completed') DEFAULT 'Pending',
  request_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- Insert test data
INSERT INTO trade_requests (id, customer_id, customer_name, customer_email, vin, year, make, model, km, condition, status, request_date) VALUES
('TR-101', 'u3', 'Jane Doe', 'customer@gmail.com', '1HGCM82633A004321', 2021, 'Honda', 'Civic', 25000, 'Great condition, no accidents.', 'Pending', '2023-10-25');

-- =====================================================
-- 12. BUDGETS TABLE
-- =====================================================
CREATE TABLE budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  period_id VARCHAR(10),
  category VARCHAR(100),
  planned_amount DECIMAL(12, 2),
  actual_amount DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO budgets (period_id, category, planned_amount, actual_amount) VALUES
('2025-02', 'Repair & Maintenance', 10000.00, 8500.00),
('2025-02', 'Repair & Maintenance', 25000.00, 28400.00),
('2025-02', 'Employee Salary', 150000.00, 145000.00),
('2025-02', 'Vehicle Purchase', 500000.00, 480000.00);

-- =====================================================
-- TEST QUERIES
-- =====================================================

-- Test: Get all vehicles with status
-- SELECT * FROM vehicles WHERE status = 'Ready';

-- Test: Get vehicles by location
-- SELECT v.*, l.name as location_name FROM vehicles v JOIN locations l ON v.location = l.id;

-- Test: Get all users with their sales
-- SELECT u.*, COUNT(v.id) as vehicles_sold FROM users u LEFT JOIN vehicles v ON u.id = v.sold_by_id WHERE u.role = 'SALES' GROUP BY u.id;

-- Test: Get recent transactions
-- SELECT t.*, ca.name as account_name FROM transactions t JOIN chart_of_accounts ca ON t.account_code = ca.code ORDER BY t.posting_date DESC LIMIT 10;

-- Test: Get invoice totals
-- SELECT customer_name, SUM(amount) as total_amount, COUNT(*) as invoice_count FROM invoices GROUP BY customer_name;

-- Test: Get vendor bills due
-- SELECT * FROM vendor_bills WHERE status = 'Pending' ORDER BY due_date ASC;

-- Test: Get contract details
-- SELECT c.contract_number, c.buyer_name, c.sale_price, c.status, v.year, v.make, v.model FROM contracts c JOIN vehicles v ON c.vehicle_id = v.id;

-- Test: Get inventory value
-- SELECT SUM(price * (IF(status = 'Sold', 0, 1))) as total_active_inventory_value FROM vehicles;

-- Test: Get account balances
-- SELECT code, name, type, balance FROM chart_of_accounts ORDER BY type, code;
