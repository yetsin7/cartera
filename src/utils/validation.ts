/**
 * Validation utilities for user inputs
 * Ensures data integrity and security
 */

export const validateAmount = (value: string): { valid: boolean; error?: string } => {
  const amount = parseFloat(value);

  if (!value || value.trim() === '') {
    return { valid: false, error: 'Amount is required' };
  }

  if (isNaN(amount)) {
    return { valid: false, error: 'Invalid amount' };
  }

  if (amount < 0) {
    return { valid: false, error: 'Amount cannot be negative' };
  }

  if (amount > 999999999) {
    return { valid: false, error: 'Amount is too large' };
  }

  if (amount === 0) {
    return { valid: false, error: 'Amount must be greater than zero' };
  }

  // Check for valid decimal places (max 2)
  const decimalPart = value.split('.')[1];
  if (decimalPart && decimalPart.length > 2) {
    return { valid: false, error: 'Maximum 2 decimal places allowed' };
  }

  return { valid: true };
};

export const validateStock = (value: string): { valid: boolean; error?: string } => {
  const stock = parseInt(value);

  if (!value || value.trim() === '') {
    return { valid: false, error: 'Stock is required' };
  }

  if (isNaN(stock)) {
    return { valid: false, error: 'Invalid stock' };
  }

  if (stock < 0) {
    return { valid: false, error: 'Stock cannot be negative' };
  }

  if (stock > 1000000) {
    return { valid: false, error: 'Stock is too large' };
  }

  return { valid: true };
};

export const validateText = (
  value: string,
  fieldName: string,
  minLength: number = 1,
  maxLength: number = 100
): { valid: boolean; error?: string } => {
  if (!value || value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  const trimmed = value.trim();

  if (trimmed.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (trimmed.length > maxLength) {
    return { valid: false, error: `${fieldName} must be less than ${maxLength} characters` };
  }

  return { valid: true };
};

export const sanitizeText = (text: string): string => {
  // Remove potentially dangerous characters
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .substring(0, 200); // Limit length
};

export const sanitizeNumber = (value: string): string => {
  // Only allow numbers and decimal point
  return value.replace(/[^0-9.]/g, '');
};

export const formatInputAmount = (value: string): string => {
  // Remove non-numeric characters except decimal point
  let cleaned = value.replace(/[^0-9.]/g, '');

  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit decimal places to 2
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + '.' + parts[1].substring(0, 2);
  }

  return cleaned;
};

export const validateQuantity = (
  value: string,
  maxStock: number
): { valid: boolean; error?: string } => {
  const quantity = parseInt(value);

  if (!value || value.trim() === '') {
    return { valid: false, error: 'Quantity is required' };
  }

  if (isNaN(quantity)) {
    return { valid: false, error: 'Invalid quantity' };
  }

  if (quantity <= 0) {
    return { valid: false, error: 'Quantity must be greater than zero' };
  }

  if (quantity > maxStock) {
    return { valid: false, error: `Only ${maxStock} units available` };
  }

  return { valid: true };
};

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email is required' };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
};

export const validateDate = (dateString: string): { valid: boolean; error?: string } => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }

  // Date shouldn't be more than 100 years in the past
  const hundredYearsAgo = new Date();
  hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);

  if (date < hundredYearsAgo) {
    return { valid: false, error: 'Date is too far in the past' };
  }

  // Date shouldn't be more than 50 years in the future
  const fiftyYearsFromNow = new Date();
  fiftyYearsFromNow.setFullYear(fiftyYearsFromNow.getFullYear() + 50);

  if (date > fiftyYearsFromNow) {
    return { valid: false, error: 'Date is too far in the future' };
  }

  return { valid: true };
};
