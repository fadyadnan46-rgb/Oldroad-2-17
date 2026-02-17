
import React, { useState, useMemo } from 'react';
import { User, Vehicle, VehicleStatus, UserRole } from '../types';
import { MOCK_VEHICLES } from '../constants';
import { Navigate } from 'react-router-dom';

interface ContractsPageProps {
  user: User | null;
}

const ContractsPage: React.FC<ContractsPageProps> = ({ user }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [search, setSearch] = useState('');
  const [selectedContract, setSelectedContract] = useState<Vehicle | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Vehicle | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SALES)) {
    return <Navigate to="/" />;
  }

  const isAdmin = user.role === UserRole.ADMIN;

  const soldVehicles = useMemo(() => {
    return vehicles.filter(v => v.status === VehicleStatus.SOLD && 
      (v.buyerName?.toLowerCase().includes(search.toLowerCase()) || 
       v.vin.toLowerCase().includes(search.toLowerCase()) || 
       v.make.toLowerCase().includes(search.toLowerCase()) ||
       v.model.toLowerCase().includes(search.toLowerCase()))
    );
  }, [vehicles, search]);

  const handlePrint = (v: Vehicle) => {
    setSelectedContract(v);
    setIsPrintModalOpen(true);
  };

  const handleEdit = (v: Vehicle) => {
    if (!isAdmin) return;
    setEditingContract({ ...v });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContract) return;

    setIsSaving(true);
    setTimeout(() => {
      setVehicles(prev => prev.map(v => v.id === editingContract.id ? editingContract : v));
      setIsSaving(false);
      setIsEditModalOpen(false);
      setEditingContract(null);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <i className="fa-solid fa-file-contract"></i>
             </div>
             <h1 className="text-4xl font-serif font-bold">Contracts Registry</h1>
          </div>
          <p className="text-slate-500">Search and manage finalized vehicle sales.</p>
        </div>
        <div className="relative w-full md:w-96">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input 
            type="text" 
            placeholder="Search by Buyer, VIN, or Model..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Contract #</th>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Buyer</th>
                <th className="px-6 py-4">Sale Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {soldVehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4 font-mono text-[10px] font-bold text-slate-400">
                    {v.id.toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{v.year} {v.make} {v.model}</p>
                    <p className="text-[10px] font-mono text-slate-400">{v.vin}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                    {v.buyerName || 'Internal Transfer'}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {v.saleDate}
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">
                    ${v.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handlePrint(v)}
                        className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                        title="View / Reprint Contract"
                      >
                        <i className="fa-solid fa-print"></i>
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleEdit(v)}
                          className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm"
                          title="Edit Contract (Admin Only)"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {soldVehicles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                       <i className="fa-solid fa-file-invoice text-6xl mb-2"></i>
                       <p className="font-bold">No contracts found.</p>
                       <p className="text-xs">Finalize a sale in the Sales Console to generate a contract.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reprint / View Modal */}
      {isPrintModalOpen && selectedContract && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPrintModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-none shadow-2xl p-12 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
             {/* Printable Styles */}
             <div className="space-y-12 border-4 border-slate-900 p-8">
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8">
                   <div>
                      <h2 className="font-serif text-3xl font-bold uppercase tracking-tighter">Bill of Sale</h2>
                      <p className="font-mono text-sm uppercase">Contract ID: {selectedContract.id.toUpperCase()}</p>
                   </div>
                   <div className="text-right">
                      <h3 className="font-serif text-xl font-bold">OldRoad Auto</h3>
                      <p className="text-xs uppercase font-bold text-slate-500">Main Showroom - Toronto, ON</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-12">
                   <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Purchaser</p>
                      <p className="text-xl font-bold border-b border-slate-900 pb-2">{selectedContract.buyerName}</p>
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Date of Transaction</p>
                      <p className="text-xl font-bold border-b border-slate-900 pb-2">{selectedContract.saleDate}</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <p className="text-[10px] font-bold uppercase text-slate-400">Vehicle Description</p>
                   <div className="bg-slate-50 p-6 space-y-4 border border-slate-200">
                      <div className="grid grid-cols-2 gap-4">
                         <div><p className="text-[10px] font-bold text-slate-500">MAKE / MODEL</p><p className="font-bold">{selectedContract.make} {selectedContract.model}</p></div>
                         <div><p className="text-[10px] font-bold text-slate-500">YEAR / TRIM</p><p className="font-bold">{selectedContract.year} {selectedContract.trim}</p></div>
                         <div className="col-span-2"><p className="text-[10px] font-bold text-slate-500">VIN NUMBER</p><p className="font-mono font-bold tracking-widest">{selectedContract.vin}</p></div>
                         <div><p className="text-[10px] font-bold text-slate-500">ODOMETER</p><p className="font-bold">{selectedContract.km.toLocaleString()} KM</p></div>
                      </div>
                   </div>
                </div>

                <div className="flex justify-between items-end border-t-2 border-slate-900 pt-8">
                   <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-8">Authorized Signature</p>
                      <p className="font-serif italic border-b border-slate-900 min-w-[200px] text-center">John Seller</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Total Purchase Price (CAD)</p>
                      <p className="text-4xl font-serif font-bold">${selectedContract.price.toLocaleString()}</p>
                   </div>
                </div>
             </div>
             
             <div className="mt-8 flex justify-center gap-4 no-print">
                <button onClick={() => window.print()} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
                   <i className="fa-solid fa-print"></i> Print Document
                </button>
                <button onClick={() => setIsPrintModalOpen(false)} className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">
                   Close Preview
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Admin Only) */}
      {isEditModalOpen && editingContract && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-serif font-bold mb-6">Edit Contract Details</h2>
            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Buyer Name</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold outline-none focus:ring-2 focus:ring-accent"
                  value={editingContract.buyerName || ''}
                  onChange={e => setEditingContract({...editingContract, buyerName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Sale Price ($)</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold outline-none focus:ring-2 focus:ring-accent"
                    value={editingContract.price}
                    onChange={e => setEditingContract({...editingContract, price: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Sale Date</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold outline-none focus:ring-2 focus:ring-accent"
                    value={editingContract.saleDate}
                    onChange={e => setEditingContract({...editingContract, saleDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Internal VIN Record (Audit Only)</label>
                <input 
                  type="text" 
                  disabled 
                  className="w-full p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl font-mono text-xs opacity-50"
                  value={editingContract.vin}
                />
              </div>
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-4 bg-accent text-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-500 transition-all active:scale-95 shadow-xl shadow-accent/20"
              >
                {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>}
                Commit Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractsPage;
