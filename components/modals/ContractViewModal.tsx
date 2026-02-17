import React from 'react';
import { X } from 'lucide-react';
import { Contract } from '../../types';

interface ContractViewModalProps {
  contract: Contract;
  onClose: () => void;
  onEdit?: (contract: Contract) => void;
  onCancel?: (contract: Contract) => void;
}

export const ContractViewModal: React.FC<ContractViewModalProps> = ({ contract, onClose, onEdit, onCancel }) => {
  const monthlyPayment = contract.monthlyPayment || ((contract.salePrice - contract.downPayment) * (1 + contract.interestRate / 100 / 12 * contract.term) / contract.term).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Contract Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>
        <div className="space-y-3">
          <div className="border-b pb-2">
            <p className="text-sm text-gray-600">Contract ID</p>
            <p className="font-semibold text-gray-800">{contract.id}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-600">Buyer Name</p>
            <p className="font-semibold text-gray-800">{contract.buyerName}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold text-gray-800">{contract.buyerEmail}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-semibold text-gray-800">{contract.buyerPhone}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-600">Vehicle ID</p>
            <p className="font-semibold text-gray-800">{contract.vehicleId || 'N/A'}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-600">Sale Price</p>
            <p className="font-semibold text-gray-800">${contract.salePrice.toFixed(2)}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-600">Down Payment</p>
            <p className="font-semibold text-gray-800">${contract.downPayment.toFixed(2)}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-600">Financed Amount</p>
            <p className="font-semibold text-gray-800">${(contract.salePrice - contract.downPayment).toFixed(2)}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-600">Term (months)</p>
            <p className="font-semibold text-gray-800">{contract.term}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-600">Interest Rate</p>
            <p className="font-semibold text-gray-800">{contract.interestRate}%</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-600">Monthly Payment</p>
            <p className="font-semibold text-gray-800">${monthlyPayment}</p>
          </div>
          <div className="border-b pb-2">
            <p className="text-sm text-gray-600">Status</p>
            <p className={contract.status === 'active' ? 'font-semibold text-green-600' : 'font-semibold text-red-600'}>
              {contract.status === 'active' ? 'Active' : 'Cancelled'}
            </p>
          </div>
          {contract.notes && (
            <div className="border-b pb-2">
              <p className="text-sm text-gray-600">Notes</p>
              <p className="text-gray-800">{contract.notes}</p>
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-4">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">Close</button>
          {onEdit && contract.status === 'active' && (
            <button onClick={() => onEdit(contract)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Edit</button>
          )}
          {onCancel && contract.status === 'active' && (
            <button onClick={() => onCancel(contract)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractViewModal;
