import { 
  Vehicle, VehicleStatus, Location, User, UserRole, TradeRequest, 
  Transaction, TransactionType, TransactionCategory, ChartOfAccount, 
  AccountType, Invoice, VendorBill, BankAccount, VendorType, BudgetPlan, ContactEntity, EntityCategory,
  Contract, ContractStatus
} from './types';

export const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1542362567-b05503f3f5f4?auto=format&fit=crop&q=80&w=800&h=600';

export const MOCK_CHART_OF_ACCOUNTS: ChartOfAccount[] = [];

export const MOCK_CONTACT_ENTITIES: ContactEntity[] = [];

export const MOCK_BUDGETS: BudgetPlan[] = [];

export const MOCK_INVOICES: Invoice[] = [];

export const MOCK_BILLS: VendorBill[] = [];

export const MOCK_BANK_ACCOUNTS: BankAccount[] = [];

export const MOCK_LOCATIONS: Location[] = [
  {
    id: 'loc1',
    name: 'Main Showroom',
    address: '123 Auto Row, Toronto, ON',
    type: 'Showroom',
    phone: '555-0100',
    email: 'sales@oldroad.auto',
    operatingHours: {
      monday: '09:00 AM - 08:00 PM',
      tuesday: '09:00 AM - 08:00 PM',
      wednesday: '09:00 AM - 08:00 PM',
      thursday: '09:00 AM - 08:00 PM',
      friday: '09:00 AM - 08:00 PM',
      saturday: '10:00 AM - 06:00 PM',
      sunday: 'Closed'
    }
  },
  {
    id: 'loc2',
    name: 'East Warehouse',
    address: '456 Industrial Pkwy, Oshawa, ON',
    type: 'Warehouse',
    phone: '555-0200',
    email: 'storage@oldroad.auto',
    operatingHours: {
      monday: '08:00 AM - 04:00 PM',
      tuesday: '08:00 AM - 04:00 PM',
      wednesday: '08:00 AM - 04:00 PM',
      thursday: '08:00 AM - 04:00 PM',
      friday: '08:00 AM - 04:00 PM',
      saturday: 'Closed',
      sunday: 'Closed'
    }
  }
];

export const MOCK_VEHICLES: Vehicle[] = [];

export const MOCK_TRANSACTIONS: Transaction[] = [];

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    email: 'admin@oldroad.auto',
    firstName: 'Master',
    lastName: 'Admin',
    role: UserRole.ADMIN,
    baseSalary: 8500.00,
    hireDate: '2012-05-15'
  },
  {
    id: 'u2',
    email: 'sales@oldroad.auto',
    firstName: 'John',
    lastName: 'Seller',
    role: UserRole.SALES,
    baseSalary: 4500.00,
    hireDate: '2021-11-01'
  },
  {
    id: 'u3',
    email: 'customer@gmail.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: UserRole.CUSTOMER
  }
];

export const MOCK_TRADE_REQUESTS: TradeRequest[] = [];

export const MOCK_CONTRACTS: Contract[] = [];
