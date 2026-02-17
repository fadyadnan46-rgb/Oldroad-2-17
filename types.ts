export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SALES = 'SALES',
  ADMIN = 'ADMIN'
}

export type Language = 'en' | 'fr' | 'es' | 'de';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  location?: string;
  baseSalary?: number;
  hireDate?: string;
}

export enum VehicleStatus {
  NEW = 'New',
  WORKING = 'Working on it',
  READY = 'Ready',
  SOLD = 'Sold'
}

export type RibbonType = 'Just Arrived' | 'Clearout' | 'None';

export interface Vehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  color: string;
  bodyStyle: string;
  fuelType: 'Gas' | 'Hybrid' | 'EV' | 'Other';
  km: number;
  price: number;
  status: VehicleStatus;
  ribbon?: RibbonType;
  images: string[];
  description?: string;
  carfaxUrl?: string;
  isCarfaxOneOwner?: boolean;
  location: string;
  transmission: string;
  engine: string;
  drivetrain: string;
  features: {
    exterior: string[];
    interior: string[];
    infotainment: string[];
    safety: string[];
  };
  soldById?: string;
  saleDate?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  salePrice?: number;
  readyToSellDate?: string;
  listedDate?: string;
  soldDate?: string;
  discount?: number;
  carfaxPdf?: string; // Base64 or URL for Carfax PDF
  publicImages?: string[]; // Images specifically for public inventory listing
  contractId?: string;
}

export enum ContractStatus {
  DRAFT = 'Draft',
  FINALIZED = 'Finalized',
  CANCELED = 'Canceled'
}

export interface ContractVehicleDetails {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  color: string;
}

export interface Contract {
  id: string;
  contractNumber: string;
  vehicleId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  salePrice: number;
  saleDate: string;
  status: ContractStatus;
  createdBy: string;
  createdDate: string;
  lastEditedBy?: string;
  lastEditedDate?: string;
  canceledBy?: string;
  canceledDate?: string;
  cancelReason?: string;
  vehicleDetails: ContractVehicleDetails;
  notes?: string;
}

// --- ADVANCED ACCOUNTING TYPES ---

export enum AccountType {
  ASSET = 'Asset',
  LIABILITY = 'Liability',
  EQUITY = 'Equity',
  REVENUE = 'Revenue',
  EXPENSE = 'Expense'
}

export interface ChartOfAccount {
  code: string;
  name: string;
  type: AccountType;
  balance: number;
  description: string;
  isLocked?: boolean;
}

export enum EntityCategory {
  VENDOR = 'Vendor',
  CUSTOMER = 'Customer',
  TRANSPORT = 'Logistics / Transport',
  UTILITY = 'Utility Provider',
  GOVERNMENT = 'Government / Tax',
  OTHER = 'Other'
}

export interface ContactEntity {
  id: string;
  name: string;
  category: EntityCategory;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  date: string;
  dueDate: string;
  customerId: string; // Refers to User.id or ContactEntity.id
  customerName: string;
  amount: number;
  taxAmount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  items: { description: string; amount: number }[];
  referenceId?: string; // Vehicle ID
  // Credit Sales Data
  downPayment?: number;
  installmentsTotal?: number;
  installmentsPaid?: number;
  penaltyRate?: number;
  attachmentUrl?: string;
  attachmentName?: string;
  notes?: string;
}

export enum VendorType {
  AUCTION = 'Auction',
  SHIPPING = 'Shipping',
  CUSTOMS = 'Customs',
  REPAIR = 'Repair Shop',
  UTILITIES = 'Utilities'
}

export interface VendorBill {
  id: string;
  billNumber: string; // External Reference (Invoice # from Vendor)
  postingDate: string; // Ledger Date
  invoiceDate: string; // Date on Bill
  systemEntryDate: string; // Date entered in system
  dueDate: string;
  vendorName: string;
  vendorType: VendorType;
  amount: number;
  taxAmount: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  category: TransactionCategory;
  referenceId?: string; // Vehicle ID
  isSharedExpense?: boolean;
  allocationMethod?: 'Revenue' | 'UnitCount' | 'Manual';
  attachmentUrl?: string;
  attachmentName?: string;
  notes?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  institution: string;
  accountNumber: string;
  balance: number;
  type: 'Checking' | 'Savings' | 'Credit';
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum TransactionCategory {
  PURCHASE = 'Vehicle Purchase',
  REPAIR = 'Repair & Maintenance',
  DETAIL = 'Detailing',
  TRANSPORT = 'Logistics',
  SALARY = 'Employee Salary',
  BONUS = 'Employee Bonus',
  SALE = 'Vehicle Sale',
  OPERATING = 'Operating Expense',
  MARKETING = 'Marketing',
  UTILITIES = 'Utilities',
  TRANSFER = 'Internal Transfer'
}

export interface Transaction {
  id: string;
  postingDate: string; // The accounting period date
  invoiceDate: string; // Source Document Date
  systemEntryDate: string; // Audit: when was this typed in?
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  taxAmount: number;
  description: string;
  locationId: string;
  referenceId?: string;
  accountCode: string;
  periodId: string; // e.g. "2025-02"

  // Payment Method Audit Fields
  paymentMethod?: 'Cash' | 'Credit';
  creditSource?: 'Bank' | 'Card';
  paymentDetail?: string; // Bank ID/Name or Card last 4
}

export interface BudgetPlan {
  periodId: string;
  category: TransactionCategory;
  plannedAmount: number;
  actualAmount: number;
}

export interface TradeRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  km: number;
  condition: string;
  status: 'Pending' | 'Reviewing' | 'Offered' | 'Completed';
  requestDate: string;
  offerAmount?: number;
  staffNotes?: string;
  appraisedBy?: string;
}

export interface OperatingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  type: 'Showroom' | 'Warehouse';
  phone: string;
  email: string;
  operatingHours: OperatingHours;
}

export interface InternalTransfer {
  id: string;
  date: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  reference: string;
  status: 'Pending' | 'Posted' | 'Void';
  fee?: number;
}
