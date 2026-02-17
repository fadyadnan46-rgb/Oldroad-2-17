import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Contract } from '../../types';

interface ContractCancelModalProps {
  contract: Contract;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const ContractCancelModal: React.FC<ContractCancelModalProps> = ({ contract, onClose, onConfirm, isLoading = false }) => {
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    if (!reason.trim()) {
      setValidationError('Please provide a reason for cancellation');
      return;
    }

    try {
      await onConfirm(reason);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Cancel Contract</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={isLoading}>
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-sm font-semibold mb-2">This action cannot be undone.</p>
          <p className="text-yellow-700 text-sm">Contract ID: <span className="font-semibold">{contract.id}</span></p>
          <p className="text-yellow-700 text-sm">Buyer: <span className="font-semibold">{contract.buyerName}</span></p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Cancellation *</label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (validationError) setValidationError('');
              }}
              rows={4}
              placeholder="Enter the reason for canceling this contract..."
              className={validationError ? 'w-full px-3 py-2 border border-red-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500' : 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'}
              disabled={isLoading}
            />
            {validationError && <p className="text-red-500 text-sm mt-1">{validationError}</p>}
          </div>

          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700" disabled={isLoading}>Keep Contract</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700" disabled={isLoading}>{isLoading ? 'Cancelling...' : 'Cancel Contract'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractCancelModal;
