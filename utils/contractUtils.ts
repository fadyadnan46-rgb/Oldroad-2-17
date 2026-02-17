import { Contract, ContractStatus } from '../types';

/**
 * Generate a unique contract number in format OR-YYYY-XXXXX
 * @param existingContracts - Array of existing contracts
 * @returns Generated contract number
 */
export const generateContractNumber = (existingContracts: Contract[]): string => {
  const year = new Date().getFullYear();
  const currentYearContracts = existingContracts.filter(
    (c) => c.contractNumber.includes(year.toString())
  );
  const nextNumber = currentYearContracts.length + 1;
  const paddedNumber = String(nextNumber).padStart(5, '0');
  return `OR-${year}-${paddedNumber}`;
};

/**
 * Check if contract can be edited (not canceled)
 * @param contract - Contract to check
 * @returns boolean
 */
export const canEditContract = (contract: Contract): boolean => {
  return contract.status !== ContractStatus.CANCELED;
};

/**
 * Check if contract can be canceled
 * @param contract - Contract to check
 * @returns boolean
 */
export const canCancelContract = (contract: Contract): boolean => {
  return (
    contract.status === ContractStatus.FINALIZED ||
    contract.status === ContractStatus.DRAFT
  );
};

/**
 * Check if a new contract can be created for a vehicle
 * @param hasExistingContract - Whether vehicle already has a contract
 * @returns boolean
 */
export const canCreateNewContract = (hasExistingContract: boolean): boolean => {
  return !hasExistingContract;
};

/**
 * Format contract status for display
 * @param status - Contract status enum value
 * @returns Formatted status string
 */
export const formatContractStatus = (status: ContractStatus): string => {
  const statusMap: Record<ContractStatus, string> = {
    [ContractStatus.DRAFT]: 'Draft',
    [ContractStatus.FINALIZED]: 'Active',
    [ContractStatus.CANCELED]: 'Canceled',
  };
  return statusMap[status] || status;
};

/**
 * Get status badge color for UI
 * @param status - Contract status
 * @returns CSS class name for badge color
 */
export const getStatusBadgeColor = (status: ContractStatus): string => {
  switch (status) {
    case ContractStatus.DRAFT:
      return 'bg-yellow-100 text-yellow-800';
    case ContractStatus.FINALIZED:
      return 'bg-green-100 text-green-800';
    case ContractStatus.CANCELED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
