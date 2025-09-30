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
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'long', // September
    day: 'numeric', // 24
    year: 'numeric', // 2025
    hour: '2-digit', // 02
    minute: '2-digit', // 30
  });
}

export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return ""; // invalid date

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

