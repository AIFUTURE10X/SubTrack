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
