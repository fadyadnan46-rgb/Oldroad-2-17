import { UserRole, Contract, ContractStatus } from '../types';

/**
 * Check if user can generate a contract
 * @param userRole - User's role
 * @returns boolean
 */
export const canUserGenerateContract = (userRole: UserRole): boolean => {
  return userRole === UserRole.ADMIN || userRole === UserRole.SALES;
};

/**
 * Check if user can edit a contract
 * @param userRole - User's role
 * @param contract - Contract to check
 * @returns boolean
 */
export const canUserEditContract = (
  userRole: UserRole,
  contract?: Contract
): boolean => {
  if (userRole !== UserRole.ADMIN) {
    return false;
  }
  if (contract && contract.status === ContractStatus.CANCELED) {
    return false;
  }
  return true;
};

/**
 * Check if user can cancel a contract
 * @param userRole - User's role
 * @returns boolean
 */
export const canUserCancelContract = (userRole: UserRole): boolean => {
  return userRole === UserRole.ADMIN;
};

/**
 * Check if user can mark a vehicle as sold
 * @param userRole - User's role
 * @returns boolean
 */
export const canUserSellVehicle = (userRole: UserRole): boolean => {
  return userRole === UserRole.ADMIN || userRole === UserRole.SALES;
};

/**
 * Check if user can reverse a sold vehicle
 * @param userRole - User's role
 * @returns boolean
 */
export const canUserReverseVehicle = (userRole: UserRole): boolean => {
  return userRole === UserRole.ADMIN || userRole === UserRole.SALES;
};

/**
 * Check if user can access vehicle details
 * @param userRole - User's role
 * @returns boolean
 */
export const canUserAccessVehicleDetails = (userRole: UserRole): boolean => {
  return (
    userRole === UserRole.ADMIN ||
    userRole === UserRole.SALES ||
    userRole === UserRole.CUSTOMER
  );
};
