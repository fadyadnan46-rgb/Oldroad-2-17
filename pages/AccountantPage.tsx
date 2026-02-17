
import React, { useState, useMemo, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  User, Vehicle, Transaction, TransactionType, TransactionCategory, 
  UserRole, VehicleStatus, ChartOfAccount, Invoice, VendorBill, BankAccount, AccountType, BudgetPlan,
  ContactEntity, EntityCategory, InternalTransfer, Location
} from '../types';
import { 
  MOCK_VEHICLES, MOCK_TRANSACTIONS,
  MOCK_CHART_OF_ACCOUNTS, MOCK_INVOICES, MOCK_BILLS, MOCK_BANK_ACCOUNTS, MOCK_BUDGETS,
  MOCK_CONTACT_ENTITIES
} from '../constants';

interface AccountantPageProps {
  user: User | null;
  locations: Location[];
}

type AccountingModule = 'dashboard' | 'gl' | 'transactions' | 'transfers' | 'ar' | 'ap' | 'banking' | 'accounts' | 'assets' | 'budgeting' | 'reports' | 'settings';
type GLSubView = 'coa' | 'journal';
type ReportType = 'income' | 'balance' | 'cashflow';

const moduleTitles: Record<AccountingModule, string> = {
  dashboard: 'Financial Overview',
  gl: 'General Ledger',
  transactions: 'Audit Trail',
  transfers: 'Internal Transfers',
  ar: 'Accounts Receivable',
  ap: 'Accounts Payable',
  banking: 'Cash & Banking',
  accounts: 'Entity Directory',
  assets: 'Branch Asset Valuation',
  budgeting: 'Budget Management',
  reports: 'Financial Statements',
  settings: 'Global Config'
};

const AccountantPage: React.FC<AccountantPageProps> = ({ user, locations }) => {
  const [activeModule, setActiveModule] = useState<AccountingModule>('dashboard');
  const [glSubView, setGlSubView] = useState<GLSubView>('coa');
  const [reportType, setReportType] = useState<ReportType>('income');
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  
  // Audit Trail Filters
  const [auditTypeFilter, setAuditTypeFilter] = useState<TransactionType | 'ALL'>('ALL');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<TransactionCategory | 'ALL'>('ALL');

  const TODAY_STR = new Date().toISOString().split('T')[0];

  // --- Core States ---
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [coa, setCoa] = useState<ChartOfAccount[]>(MOCK_CHART_OF_ACCOUNTS);
  const [banks] = useState<BankAccount[]>(MOCK_BANK_ACCOUNTS);
  const [bills, setBills] = useState<VendorBill[]>(MOCK_BILLS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [entities, setEntities] = useState<ContactEntity[]>(MOCK_CONTACT_ENTITIES);
  const [transfers, setTransfers] = useState<InternalTransfer[]>([]);
  const [budgets] = useState<BudgetPlan[]>(MOCK_BUDGETS);

  // Settings State
  const [settings, setSettings] = useState({
    fiscalYearStart: '01-01',
    taxRate: 13,
    currency: 'CAD',
    ledgerLocked: false,
    autoPostInvoices: true
  });

  // Modal States
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddTransferModalOpen, setIsAddTransferModalOpen] = useState(false);
  const [isVoidConfirmOpen, setIsVoidConfirmOpen] = useState(false);
  const [transactionToVoid, setTransactionToVoid] = useState<Transaction | null>(null);

  // Form States
  const [transferForm, setTransferForm] = useState({
    source: MOCK_CHART_OF_ACCOUNTS[0].code,
    destination: MOCK_CHART_OF_ACCOUNTS[1].code,
    amount: 0,
    reference: ''
  });

  // Reset search when module changes
  useEffect(() => {
    setGlobalSearch('');
  }, [activeModule]);

  if (!user || user.role !== UserRole.ADMIN) {
    return <Navigate to="/auth" />;
  }

  // --- Multi-Branch Filtering Logic ---
  const branchFilteredTransactions = useMemo(() => {
    return transactions.filter(t => selectedBranchId === 'all' || t.locationId === selectedBranchId);
  }, [transactions, selectedBranchId]);

  const branchFilteredInvoices = useMemo(() => {
    // In our mock, invoices don't have locationId directly, so we map them to the locations of referenced vehicles if exists
    // For simplicity, if branch is 'all', show all. 
    // In a real app, Invoice would have a locationId.
    return invoices.filter(inv => 
      inv.customerName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      inv.id.toLowerCase().includes(globalSearch.toLowerCase())
    );
  }, [invoices, globalSearch]);

  const stats = useMemo(() => {
    const income = branchFilteredTransactions
      .filter(t => t.type === TransactionType.INCOME && t.category !== TransactionCategory.TRANSFER)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = branchFilteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE && t.category !== TransactionCategory.TRANSFER)
      .reduce((sum, t) => sum + t.amount, 0);
    const assets = coa.filter(a => a.type === AccountType.ASSET).reduce((sum, a) => sum + a.balance, 0);
    return { income, expense, profit: income - expense, assets };
  }, [branchFilteredTransactions, coa]);

  const arStats = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const outstanding = invoices.filter(inv => inv.status !== 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
    const overdue = invoices.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + inv.amount, 0);
    return { total, outstanding, overdue };
  }, [invoices]);

  const filteredJournal = useMemo(() => {
    return branchFilteredTransactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(globalSearch.toLowerCase()) || 
                           tx.accountCode.includes(globalSearch) ||
                           tx.id.toLowerCase().includes(globalSearch.toLowerCase());
      const matchesType = auditTypeFilter === 'ALL' || tx.type === auditTypeFilter;
      const matchesCategory = auditCategoryFilter === 'ALL' || tx.category === auditCategoryFilter;
      
      return matchesSearch && matchesType && matchesCategory;
    }).sort((a, b) => b.postingDate.localeCompare(a.postingDate));
  }, [branchFilteredTransactions, globalSearch, auditTypeFilter, auditCategoryFilter]);

  const assetAnalysis = useMemo(() => {
    return MOCK_VEHICLES
      .filter(v => 
        (selectedBranchId === 'all' || v.location === locations.find(l => l.id === selectedBranchId)?.name) &&
        (`${v.make} ${v.model}`.toLowerCase().includes(globalSearch.toLowerCase()) || v.vin.toLowerCase().includes(globalSearch.toLowerCase()))
      )
      .map(v => {
        const costs = transactions.filter(t => t.referenceId === v.id);
        const totalCost = costs.reduce((sum, t) => sum + t.amount, 0);
        return { ...v, totalCost, profit: v.status === VehicleStatus.SOLD ? v.price - totalCost : null };
      });
  }, [transactions, globalSearch, selectedBranchId, locations]);

  // --- Handlers ---
  const handleVoidTransaction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!transactionToVoid) return;
    setTransactions(prev => prev.filter(tx => tx.id !== transactionToVoid.id));
    setIsVoidConfirmOpen(false);
    setTransactionToVoid(null);
  };

  const handleExportXLSX = (e: React.MouseEvent) => {
    e.stopPropagation();
    const data = filteredJournal.map(tx => ({
      ID: tx.id, 
      PostingDate: tx.postingDate, 
      SystemEntryDate: tx.systemEntryDate,
      Description: tx.description, 
      Category: tx.category,
      Type: tx.type, 
      Amount: tx.amount, 
      Branch: tx.locationId,
      AccountCode: tx.accountCode
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AuditTrail");
    XLSX.writeFile(wb, `OldRoad_Audit_${selectedBranchId}_${TODAY_STR}.xlsx`);
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransfer: InternalTransfer = {
      id: `IT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      date: TODAY_STR,
      sourceAccountId: transferForm.source,
      destinationAccountId: transferForm.destination,
      amount: transferForm.amount,
      currency: settings.currency,
      reference: transferForm.reference,
      status: 'Pending'
    };
    setTransfers(prev => [newTransfer, ...prev]);
    setIsAddTransferModalOpen(false);
    setTransferForm({ ...transferForm, amount: 0, reference: '' });
  };

  const postTransfer = (e: React.MouseEvent, transfer: InternalTransfer) => {
    e.stopPropagation();
    const txId = `TRF-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const newTxs: Transaction[] = [
      {
        id: `${txId}-A`, postingDate: TODAY_STR, invoiceDate: TODAY_STR, systemEntryDate: TODAY_STR,
        type: TransactionType.EXPENSE, category: TransactionCategory.TRANSFER, amount: transfer.amount,
        taxAmount: 0, description: `Transfer Out [Ref: ${transfer.reference}]`, locationId: selectedBranchId === 'all' ? 'loc1' : selectedBranchId,
        accountCode: transfer.sourceAccountId, periodId: TODAY_STR.slice(0, 7)
      },
      {
        id: `${txId}-B`, postingDate: TODAY_STR, invoiceDate: TODAY_STR, systemEntryDate: TODAY_STR,
        type: TransactionType.INCOME, category: TransactionCategory.TRANSFER, amount: transfer.amount,
        taxAmount: 0, description: `Transfer In [Ref: ${transfer.reference}]`, locationId: selectedBranchId === 'all' ? 'loc1' : selectedBranchId,
        accountCode: transfer.destinationAccountId, periodId: TODAY_STR.slice(0, 7)
      }
    ];
    setTransactions(prev => [...newTxs, ...prev]);
    setTransfers(prev => prev.map(t => t.id === transfer.id ? { ...t, status: 'Posted' } : t));
  };

  const handleMarkInvoiceAsPaid = (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv));
    // In a real app, this would also create a 'Revenue' transaction in the ledger.
  };

  // --- Sub-View Components ---
  const SearchBar = () => (
    <div className="relative flex-grow max-w-md">
      <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
      <input 
        type="text" 
        placeholder="Search registry..." 
        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 outline-none focus:ring-2 focus:ring-accent text-sm font-medium" 
        value={globalSearch} 
        onChange={e => setGlobalSearch(e.target.value)} 
      />
    </div>
  );

  const BranchSelector = () => (
    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl shadow-sm">
      <i className="fa-solid fa-building-user text-slate-400"></i>
      <select 
        className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 cursor-pointer"
        value={selectedBranchId}
        onChange={e => setSelectedBranchId(e.target.value)}
      >
        <option value="all">Consolidated View</option>
        {locations.map(loc => (
          <option key={loc.id} value={loc.id}>{loc.name}</option>
        ))}
      </select>
    </div>
  );

  // --- Module Renderers ---
  const renderGeneralLedger = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-sm">
        <button onClick={() => setGlSubView('coa')} className={`flex-1 py-2 px-4 rounded-xl font-bold text-xs transition-all ${glSubView === 'coa' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Chart of Accounts</button>
        <button onClick={() => setGlSubView('journal')} className={`flex-1 py-2 px-4 rounded-xl font-bold text-xs transition-all ${glSubView === 'journal' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Journal Log</button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/20">
          <SearchBar />
          {glSubView === 'coa' && (
            <button onClick={() => setIsAddTransactionOpen(true)} className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-xs hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2">
              <i className="fa-solid fa-plus-circle"></i> Manual Journal
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5">{glSubView === 'coa' ? 'Code' : 'Posting Date'}</th>
                <th className="px-8 py-5">Description / Name</th>
                <th className="px-8 py-5">Branch / Category</th>
                <th className="px-8 py-5 text-right">Balance / Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {glSubView === 'coa' ? coa.map(acc => (
                <tr key={acc.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-8 py-5 font-mono font-bold text-slate-400">{acc.code}</td>
                  <td className="px-8 py-5 font-bold text-slate-900 dark:text-white text-sm">{acc.name}</td>
                  <td className="px-8 py-5 uppercase text-[10px] font-bold text-slate-400">{acc.type}</td>
                  <td className="px-8 py-5 text-right font-mono font-bold text-sm text-primary dark:text-white">${acc.balance.toLocaleString()}</td>
                </tr>
              )) : filteredJournal.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-8 py-5 text-xs text-slate-500">{tx.postingDate}</td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{tx.description}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">ID: {tx.id}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {locations.find(l => l.id === tx.locationId)?.name || 'Central'}
                    </span>
                  </td>
                  <td className={`px-8 py-5 text-right font-mono font-bold text-sm ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === TransactionType.INCOME ? '+' : '-'}${tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAccountsReceivable = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Outstanding</p>
            <p className="text-2xl font-bold text-primary dark:text-white">${arStats.outstanding.toLocaleString()}</p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Overdue Amount</p>
            <p className="text-2xl font-bold text-rose-600">${arStats.overdue.toLocaleString()}</p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Collection Efficiency</p>
            <p className="text-2xl font-bold text-emerald-600">{Math.round((arStats.total - arStats.outstanding) / arStats.total * 100)}%</p>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/20">
           <SearchBar />
           <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-2">
              <i className="fa-solid fa-file-invoice"></i> New Invoice
           </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5">Invoice #</th>
                <th className="px-8 py-5">Date / Client</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Value</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {branchFilteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-8 py-5">
                     <p className="font-mono font-bold text-primary dark:text-white text-xs">{inv.id}</p>
                     <p className="text-[9px] text-slate-400 font-bold uppercase">Due: {inv.dueDate}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{inv.customerName}</p>
                    <p className="text-[10px] text-slate-500">{inv.date}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase ${
                      inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 
                      inv.status === 'Overdue' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-mono font-bold text-sm text-primary dark:text-white">
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       {inv.status !== 'Paid' && (
                         <button 
                           onClick={(e) => handleMarkInvoiceAsPaid(e, inv.id)}
                           className="bg-emerald-600 text-white p-2 rounded-xl text-[10px] font-bold uppercase hover:bg-emerald-700 transition-all active:scale-95"
                           title="Record Payment"
                         >
                           <i className="fa-solid fa-check"></i>
                         </button>
                       )}
                       <button className="bg-slate-100 dark:bg-slate-800 text-slate-400 p-2 rounded-xl hover:text-primary transition-all shadow-sm">
                          <i className="fa-solid fa-envelope"></i>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {branchFilteredInvoices.length === 0 && (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400 italic">No invoices found matching criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAuditTrail = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col gap-1.5">
           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Flow Type</label>
           <select 
             className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl text-xs font-bold outline-none border-none focus:ring-2 focus:ring-accent"
             value={auditTypeFilter}
             onChange={e => setAuditTypeFilter(e.target.value as any)}
           >
              <option value="ALL">All Flows</option>
              <option value={TransactionType.INCOME}>Income Only</option>
              <option value={TransactionType.EXPENSE}>Expenses Only</option>
           </select>
        </div>
        <div className="flex flex-col gap-1.5">
           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Category Registry</label>
           <select 
             className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl text-xs font-bold outline-none border-none focus:ring-2 focus:ring-accent"
             value={auditCategoryFilter}
             onChange={e => setAuditCategoryFilter(e.target.value as any)}
           >
              <option value="ALL">All Categories</option>
              {Object.values(TransactionCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
           </select>
        </div>
        <div className="flex-grow flex flex-col gap-1.5">
           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Deep Search</label>
           <SearchBar />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5">Transaction Stamp</th>
                <th className="px-8 py-5">Ledger Allocation</th>
                <th className="px-8 py-5">Audit Identity</th>
                <th className="px-8 py-5">System Entry</th>
                <th className="px-8 py-5 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredJournal.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{tx.postingDate}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Accounting Date</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{tx.description}</p>
                    <span className="text-[9px] font-bold text-primary dark:text-white bg-accent/10 px-2 py-0.5 rounded mr-2">{tx.accountCode}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{tx.category}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-mono font-bold text-slate-500">{tx.id}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Branch: {locations.find(l => l.id === tx.locationId)?.name || 'Central'}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className={`text-xs font-bold ${tx.postingDate === tx.systemEntryDate ? 'text-slate-400' : 'text-amber-600'}`}>
                      {tx.systemEntryDate}
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Record Created</p>
                  </td>
                  <td className={`px-8 py-5 text-right font-mono font-bold text-sm ${tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === TransactionType.INCOME ? '+' : '-'}${tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredJournal.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 italic">No entries match the current audit filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTransfers = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/20">
          <h3 className="font-bold text-xl">Branch Fund Movements</h3>
          <button onClick={(e) => { e.stopPropagation(); setIsAddTransferModalOpen(true); }} className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-slate-800 shadow-lg active:scale-95">
            <i className="fa-solid fa-right-left"></i> Record Transfer
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Route</th>
                <th className="px-8 py-5">Reference / Note</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Amount</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transfers.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="px-8 py-5 text-xs text-slate-500 font-bold">{t.date}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold">
                       <span className="text-slate-400">{t.sourceAccountId}</span>
                       <i className="fa-solid fa-arrow-right text-[10px] text-accent"></i>
                       <span className="text-primary dark:text-white">{t.destinationAccountId}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 italic">
                      {t.reference || <span className="text-slate-300">No reference provided</span>}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase ${t.status === 'Posted' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{t.status}</span>
                  </td>
                  <td className="px-8 py-5 text-right font-mono font-bold text-sm">${t.amount.toLocaleString()}</td>
                  <td className="px-8 py-5 text-right">
                    {t.status === 'Pending' && <button onClick={(e) => postTransfer(e, t)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-emerald-700 active:scale-95">Post Ledger</button>}
                  </td>
                </tr>
              ))}
              {transfers.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400 italic text-sm">No internal transfers registered for this branch context.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h4 className="text-sm font-bold text-primary dark:text-white uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-sliders text-blue-500"></i> Financial Parameters
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Default Tax Rate (HST/VAT)</span>
              <div className="flex items-center gap-2">
                <input type="number" className="w-16 p-2 bg-white dark:bg-slate-900 border rounded-lg text-center font-bold" value={settings.taxRate} onChange={e => setSettings({...settings, taxRate: parseInt(e.target.value)})} />
                <span className="text-xs font-bold text-slate-400">%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
               <div>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Lock Post-Period Ledger</p>
                  <p className="text-[9px] text-slate-500">Prevent historical modifications.</p>
               </div>
               <button onClick={(e) => { e.stopPropagation(); setSettings({...settings, ledgerLocked: !settings.ledgerLocked}); }} className={`w-12 h-6 rounded-full relative transition-colors ${settings.ledgerLocked ? 'bg-rose-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.ledgerLocked ? 'left-7' : 'left-1'}`}></div>
               </button>
            </div>
          </div>
        </div>
        <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
               <h4 className="text-xl font-bold">Cloud API Integrations</h4>
               <p className="text-slate-400 text-xs leading-relaxed">Link your showroom bank accounts directly via Plaid to automate reconciliation and transaction tagging.</p>
               <button onClick={(e) => e.stopPropagation()} className="bg-accent text-primary px-6 py-3 rounded-xl font-bold text-xs hover:bg-amber-500 active:scale-95 transition-all">Setup Webhooks</button>
            </div>
            <i className="fa-solid fa-network-wired absolute -bottom-8 -right-8 text-8xl text-white/5 group-hover:rotate-12 transition-transform"></i>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-primary text-white flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-8 border-b border-white/5">
          <h2 className="text-xl font-serif font-bold tracking-tight text-white">Financial Suite</h2>
          <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mt-1">OldRoad ERP v4.0</p>
        </div>
        <nav className="flex-grow py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {([
            { id: 'dashboard', label: 'Overview', icon: 'fa-chart-line' },
            { id: 'gl', label: 'General Ledger', icon: 'fa-book' },
            { id: 'transactions', label: 'Audit Trail', icon: 'fa-right-left' },
            { id: 'transfers', label: 'Fund Transfers', icon: 'fa-money-bill-transfer' },
            { id: 'ar', label: 'Receivables', icon: 'fa-file-invoice-dollar' },
            { id: 'ap', label: 'Payables', icon: 'fa-receipt' },
            { id: 'banking', label: 'Banking Hub', icon: 'fa-building-columns' },
            { id: 'assets', label: 'Asset Costing', icon: 'fa-car-burst' },
            { id: 'budgeting', label: 'Budgeting', icon: 'fa-bullseye' },
            { id: 'reports', label: 'Reports', icon: 'fa-chart-pie' },
            { id: 'settings', label: 'Settings', icon: 'fa-gear' }
          ] as const).map(mod => (
            <button key={mod.id} onClick={() => setActiveModule(mod.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group ${activeModule === mod.id ? 'bg-accent text-primary shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <i className={`fa-solid ${mod.icon} w-5 text-center`}></i> {mod.label}
              {activeModule === mod.id && <i className="fa-solid fa-chevron-right ml-auto text-[10px]"></i>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-grow p-8 md:p-12 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">
                {moduleTitles[activeModule]}
              </h1>
              <BranchSelector />
            </div>
            <p className="text-slate-500 font-medium text-sm">Context: <span className="text-primary dark:text-white font-bold">{selectedBranchId === 'all' ? 'All Operations' : locations.find(l => l.id === selectedBranchId)?.name}</span></p>
          </div>
          <div className="flex gap-3">
             <button onClick={handleExportXLSX} className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-emerald-100 shadow-sm"><i className="fa-solid fa-file-excel"></i> Export Audit</button>
             <button onClick={() => window.print()} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"><i className="fa-solid fa-print text-slate-400"></i></button>
          </div>
        </header>

        {activeModule === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Branch Revenue', value: stats.income, color: 'text-emerald-600', icon: 'fa-sack-dollar' },
                  { label: 'Branch Expenses', value: stats.expense, color: 'text-rose-600', icon: 'fa-money-bill-transfer' },
                  { label: 'Operating Profit', value: stats.profit, color: 'text-primary dark:text-white', icon: 'fa-chart-line' },
                  { label: 'Stock Valuation', value: stats.assets, color: 'text-blue-600', icon: 'fa-building' }
                ].map(card => (
                  <div key={card.label} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{card.label}</p>
                      <p className={`text-3xl font-bold ${card.color}`}>${card.value.toLocaleString()}</p>
                    </div>
                    <i className={`fa-solid ${card.icon} absolute -right-4 -bottom-4 text-7xl text-slate-50 dark:text-slate-800/50 -rotate-12 group-hover:rotate-0 transition-transform duration-500`}></i>
                  </div>
                ))}
             </div>
             
             {selectedBranchId === 'all' && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {locations.map(loc => {
                    const locIncome = transactions
                      .filter(t => t.locationId === loc.id && t.type === TransactionType.INCOME)
                      .reduce((sum, t) => sum + t.amount, 0);
                    return (
                      <div key={loc.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm">{loc.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Contribution</p>
                        </div>
                        <p className="font-mono font-bold text-emerald-600">${locIncome.toLocaleString()}</p>
                      </div>
                    );
                  })}
               </div>
             )}

             <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/20">
                   <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400">Recent Operational Activity</h3>
                   <SearchBar />
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                   {filteredJournal.slice(0, 10).map((t) => (
                      <div key={t.id} className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${t.type === TransactionType.INCOME ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                <i className={`fa-solid ${t.type === TransactionType.INCOME ? 'fa-arrow-trend-up' : 'fa-receipt'}`}></i>
                            </div>
                            <div>
                                <p className="font-bold text-sm">{t.description}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                                  <span className="font-bold">{t.postingDate}</span> &bull; <span>ID: {t.id}</span>
                                </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <p className={`font-mono font-bold text-sm ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>{t.type === TransactionType.INCOME ? '+' : '-'}${t.amount.toLocaleString()}</p>
                            <button onClick={(e) => { e.stopPropagation(); setTransactionToVoid(t); setIsVoidConfirmOpen(true); }} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><i className="fa-solid fa-ban"></i></button>
                          </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeModule === 'gl' && renderGeneralLedger()}
        {activeModule === 'ar' && renderAccountsReceivable()}
        {activeModule === 'transactions' && renderAuditTrail()}
        {activeModule === 'transfers' && renderTransfers()}
        {activeModule === 'settings' && renderSettings()}

        {activeModule === 'assets' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/20">
                   <h3 className="font-bold text-xl">Branch Asset Portfolio</h3>
                   <SearchBar />
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                         <tr>
                            <th className="px-8 py-5">Vehicle Asset</th>
                            <th className="px-8 py-5">Current Showroom</th>
                            <th className="px-8 py-5 text-right">Capitalized Cost</th>
                            <th className="px-8 py-5 text-right">Est. Margin</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                         {assetAnalysis.map(asset => (
                           <tr key={asset.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                              <td className="px-8 py-6">
                                 <p className="font-bold text-sm">{asset.year} {asset.make} {asset.model}</p>
                                 <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{asset.vin}</p>
                              </td>
                              <td className="px-8 py-6 text-xs font-bold text-slate-500">{asset.location}</td>
                              <td className="px-8 py-6 text-right font-mono font-bold text-sm">${asset.totalCost.toLocaleString()}</td>
                              <td className={`px-8 py-6 text-right font-bold text-sm ${asset.profit && asset.profit >= 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                 {asset.profit !== null ? `$${asset.profit.toLocaleString()}` : 'Stocked'}
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* --- Modals --- */}
      {isAddTransactionOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={(e) => { e.stopPropagation(); setIsAddTransactionOpen(false); }}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] p-12 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
             <h2 className="text-3xl font-serif font-bold mb-8">Manual Ledger Entry</h2>
             <form onSubmit={(e) => { e.preventDefault(); setIsAddTransactionOpen(false); }} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Branch</label>
                  <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs border">
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                  <input type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border" placeholder="Enter memo..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Amount</label>
                    <input type="number" className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Account Code</label>
                    <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs border">
                      {coa.map(acc => <option key={acc.code} value={acc.code}>{acc.name}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all">Commit to Ledger</button>
             </form>
          </div>
        </div>
      )}

      {isAddTransferModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={(e) => { e.stopPropagation(); setIsAddTransferModalOpen(false); }}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] p-12 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
             <h2 className="text-3xl font-serif font-bold mb-8">Internal Transfer</h2>
             <form onSubmit={handleCreateTransfer} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Source GL Account</label>
                    <select 
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs border"
                      value={transferForm.source}
                      onChange={e => setTransferForm({...transferForm, source: e.target.value})}
                    >
                      {coa.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Dest GL Account</label>
                    <select 
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold text-xs border"
                      value={transferForm.destination}
                      onChange={e => setTransferForm({...transferForm, destination: e.target.value})}
                    >
                      {coa.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Transfer Amount</label>
                  <input 
                    type="number" 
                    required
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-bold border" 
                    placeholder="0.00" 
                    value={transferForm.amount}
                    onChange={e => setTransferForm({...transferForm, amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Reference / Note</label>
                  <textarea 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-medium text-sm border h-24 outline-none focus:ring-2 focus:ring-accent" 
                    placeholder="E.g., Payroll Funding, Inter-branch loan, Tax allocation..." 
                    value={transferForm.reference}
                    onChange={e => setTransferForm({...transferForm, reference: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all">Execute Internal Transfer</button>
             </form>
          </div>
        </div>
      )}

      {isVoidConfirmOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl text-center border border-slate-200">
             <i className="fa-solid fa-triangle-exclamation text-rose-500 text-4xl mb-6"></i>
             <h2 className="text-2xl font-serif font-bold mb-4">Void Entry?</h2>
             <p className="text-slate-500 mb-8">This action is permanent and will remove this record from all branch reports.</p>
             <div className="flex gap-4">
               <button onClick={(e) => { e.stopPropagation(); setIsVoidConfirmOpen(false); }} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">Cancel</button>
               <button onClick={handleVoidTransaction} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold">Confirm Void</button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        @media print { .no-print { display: none !important; } aside { display: none !important; } main { width: 100% !important; padding: 20px !important; background: white !important; } table { width: 100% !important; } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AccountantPage;
