import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SaleFormData } from '../../types';

interface SaleFormProps {
  onClose: () => void;
  onSubmit: (data: SaleFormData) => Promise<void>;
  isLoading?: boolean;
}

export const SaleForm: React.FC<SaleFormProps> = ({ onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<SaleFormData>({
    customerName: '',
    email: '',
    phone: '',
    vehicleId: '',
    saleDate: new Date().toISOString().split('T')[0],
    amount: 0,
    notes: '',
  });

  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.customerName.trim()) errors.customerName = 'Customer name required';
    if (!formData.email.trim()) errors.email = 'Email required';
    if (!formData.phone.trim()) errors.phone = 'Phone required';
    if (!formData.vehicleId.trim()) errors.vehicleId = 'Vehicle ID required';
    if (formData.amount <= 0) errors.amount = 'Amount must be > 0';
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
    setFormData(prev => ({...prev, [name]: name === 'amount' ? parseFloat(value) || 0 : value}));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">New Sale</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isLoading}><X size={24} /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
            {validationErrors.customerName && <p className="text-red-500 text-sm mt-1">{validationErrors.customerName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle ID *</label>
            <input type="text" name="vehicleId" value={formData.vehicleId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale Date</label>
            <input type="date" name="saleDate" value={formData.saleDate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleChange} step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isLoading} />
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" disabled={isLoading}>Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleForm;
