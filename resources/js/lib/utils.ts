import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function capitalizeFirstLetter(str: string): string {
    if (!str) return ""; 
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
export function calculateMonthsDelayed(dueDate: string): number {
  const today = new Date();
  const due = new Date(dueDate);

  let months =
    (today.getFullYear() - due.getFullYear()) * 12 +
    (today.getMonth() - due.getMonth());

  return months > 0 ? months : 0;
}

export function calculatePayment(
  planPrice: number,
  dueDate: string,
  credit: number
): number {
  const delayedMonths = calculateMonthsDelayed(dueDate);
  const monthsToPay = delayedMonths > 0 ? delayedMonths + 1 : 1;

  let total = planPrice * monthsToPay;
  if (credit > 0) {
    total -= credit;
  }
  return total;
}