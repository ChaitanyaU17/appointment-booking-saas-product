import { format as formatDate } from 'date-fns';

export const formatIST = (date: string | Date, pattern = 'dd MMM yyyy, hh:mm a') => {
  return formatDate(new Date(date), pattern);
};

export const formatINR = (amount: number = 0) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];