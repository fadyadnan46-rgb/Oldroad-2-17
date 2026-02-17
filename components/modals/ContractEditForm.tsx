import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Contract, ContractFormData } from '../../types';

interface ContractEditFormProps {
  contract: Contract;
  onClose: () => void;
  onSubmit: (data: ContractFormData) => Promise<void>;
  isLoading?: boolean;
}

export const ContractEditForm: React.FC<ContractEditFormProps> = ({ contract, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<ContractFormData>({
    buyerName: contract.buyerName,
    buyerEmail: contract.buyerEmail,
    buyerPhone: contract.buyerPhone,
    salePrice: contract.salePrice,
    downPayment: contract.downPayment,
    term: contract.term,
    interestRate: contract.interestRate,
    vehicleId: contract.vehicleId || '',
    notes: contract.notes || '',
  });

  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.buyerName.trim()) errors.buyerName = 'Buyer name required';
    if (!formData.buyerEmail.trim()) errors.buyerEmail = 'Email required';
    if (!formData.buyerPhone.trim()) errors.buyerPhone = 'Phone required';
    if (formData.salePrice <= 0) errors.salePrice = 'Sale price required';
    if (formData.downPayment < 0) errors.downPayment = 'Invalid down payment';
    if (formData.term <= 0) errors.term = 'Invalid term';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: ['salePrice','downPayment','term','interestRate'].includes(name) ? parseFloat(value) || 0 : value}));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Edit Contract</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isLoading}><X size={24} /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name *</label>
            <input type="text" name="buyerName" value={formData.buyerName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" name="buyerEmail" value={formData.buyerEmail} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input type="tel" name="buyerPhone" value={formData.buyerPhone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price *</label>
            <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment *</label>
            <input type="number" name="downPayment" value={formData.downPayment} onChange={handleChange} step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term (months) *</label>
            <input type="number" name="term" value={formData.term} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate % *</label>
            <input type="number" name="interestRate" value={formData.interestRate} onChange={handleChange} step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" disabled={isLoading}>Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractEditForm;
