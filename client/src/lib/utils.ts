import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { BillingCycleEnum, CurrencyEnum, StatusEnum, type Subscription } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date);
  }
  return format(date, "MMMM d, yyyy");
}

export function formatCurrency(amount: number, currency: string = "AUD"): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function calculateSummary(subscriptions: Subscription[]) {
  // Calculate monthly and yearly totals for active subscriptions
  const activeSubscriptions = subscriptions.filter(sub => sub.status === StatusEnum.ACTIVE);
  
  let monthlyTotal = 0;
  let yearlyTotal = 0;
  
  activeSubscriptions.forEach(sub => {
    const amount = sub.amount;
    
    switch (sub.billingCycle) {
      case BillingCycleEnum.WEEKLY:
        monthlyTotal += amount * 4.33; // Average 4.33 weeks in a month
        yearlyTotal += amount * 52;
        break;
      case BillingCycleEnum.MONTHLY:
        monthlyTotal += amount;
        yearlyTotal += amount * 12;
        break;
      case BillingCycleEnum.QUARTERLY:
        monthlyTotal += amount / 3;
        yearlyTotal += amount * 4;
        break;
      case BillingCycleEnum.YEARLY:
        monthlyTotal += amount / 12;
        yearlyTotal += amount;
        break;
      default:
        monthlyTotal += amount;
        yearlyTotal += amount * 12;
    }
  });
  
  return {
    monthlyTotal: parseFloat(monthlyTotal.toFixed(2)),
    yearlyTotal: parseFloat(yearlyTotal.toFixed(2)),
    activeCount: activeSubscriptions.length,
    pausedCount: subscriptions.length - activeSubscriptions.length,
    totalCount: subscriptions.length
  };
}

export function getIconForSubscription(name: string, customIcon?: string): string {
  if (customIcon) return customIcon;
  
  // Default mapping for common subscription services
  const iconMap: Record<string, string> = {
    "netflix": "film",
    "youtube": "youtube",
    "spotify": "music",
    "amazon": "shopping-cart",
    "prime": "box",
    "hulu": "tv",
    "disney": "star",
    "apple": "apple",
    "google": "google",
    "microsoft": "windows",
    "adobe": "file",
    "dropbox": "hard-drive",
    "ai": "bot",
    "mobile": "mobile",
    "phone": "phone"
  };
  
  // Check if name contains any of the keys
  const nameLower = name.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (nameLower.includes(key)) {
      return icon;
    }
  }
  
  // Default icon
  return "credit-card";
}

/**
 * Checks if a payment is due within the specified number of days
 * @param nextPaymentDate The next payment date
 * @param days Number of days to check
 * @returns Boolean indicating if payment is due within specified days
 */
export function isPaymentDueSoon(nextPaymentDate: Date | string, days: number): boolean {
  const paymentDate = new Date(nextPaymentDate);
  const today = new Date();
  
  // Clear time portion for accurate day calculation
  paymentDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  // Calculate the difference in milliseconds
  const differenceMs = paymentDate.getTime() - today.getTime();
  
  // Convert to days
  const differenceDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
  
  // Return true if payment is due within specified days
  return differenceDays >= 0 && differenceDays <= days;
}

/**
 * Get upcoming payment reminders
 * @param subscriptions List of all subscriptions
 * @returns Object with subscriptions due in 1 day and 3 days
 */
export function getUpcomingReminders(subscriptions: Subscription[]) {
  const dueTomorrow: Subscription[] = [];
  const dueInThreeDays: Subscription[] = [];
  
  subscriptions.forEach(subscription => {
    // Only process active subscriptions
    if (subscription.status === StatusEnum.ACTIVE) {
      if (isPaymentDueSoon(subscription.nextPaymentDate, 1)) {
        dueTomorrow.push(subscription);
      } else if (isPaymentDueSoon(subscription.nextPaymentDate, 3)) {
        dueInThreeDays.push(subscription);
      }
    }
  });
  
  return {
    dueTomorrow,
    dueInThreeDays
  };
}
