import { subscriptions, paymentHistory, type Subscription, type InsertSubscription, type PaymentHistory, type InsertPaymentHistory } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  
  // Subscription methods
  getAllSubscriptions(): Promise<Subscription[]>;
  getSubscription(id: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  deleteSubscription(id: number): Promise<boolean>;
  
  // Payment history methods
  getPaymentHistoryBySubscription(subscriptionId: number): Promise<PaymentHistory[]>;
  addPaymentHistory(payment: InsertPaymentHistory): Promise<PaymentHistory>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private subscriptionsMap: Map<number, Subscription>;
  private paymentsMap: Map<number, PaymentHistory>;
  private currentUserId: number;
  private currentSubscriptionId: number;
  private currentPaymentId: number;

  constructor() {
    this.users = new Map();
    this.subscriptionsMap = new Map();
    this.paymentsMap = new Map();
    this.currentUserId = 1;
    this.currentSubscriptionId = 1;
    this.currentPaymentId = 1;
    
    // Add some example subscriptions for demo purposes
    const sampleSubscriptions: InsertSubscription[] = [
      {
        name: "CopyCoder",
        amount: 23.65,
        currency: "AUD",
        billingCycle: "Monthly",
        nextPaymentDate: new Date("2025-04-18"),
        status: "Active",
        notes: "Software to generate code",
        icon: "sync-alt",
        iconColor: "#3B82F6"
      },
      {
        name: "YouTube",
        amount: 10.00,
        currency: "AUD",
        billingCycle: "Monthly",
        nextPaymentDate: new Date("2025-04-15"),
        status: "Active",
        notes: "Premium music and video subscription",
        icon: "youtube",
        iconColor: "#EF4444"
      },
      {
        name: "Acubas Ai",
        amount: 16.00,
        currency: "AUD",
        billingCycle: "Monthly",
        nextPaymentDate: new Date("2025-04-21"),
        status: "Active",
        notes: "AI service for content generation",
        icon: "robot",
        iconColor: "#60A5FA"
      },
      {
        name: "Amaysim",
        amount: 15.00,
        currency: "AUD",
        billingCycle: "Monthly",
        nextPaymentDate: new Date("2025-04-30"),
        status: "Active",
        notes: "Mobile phone subscription",
        icon: "mobile-alt",
        iconColor: "#34D399"
      },
      {
        name: "Netflix",
        amount: 19.90,
        currency: "AUD",
        billingCycle: "Monthly",
        nextPaymentDate: new Date("2025-04-15"),
        status: "Paused",
        notes: "Movies and TV shows streaming service",
        icon: "film",
        iconColor: "#DC2626"
      }
    ];
    
    // Add sample subscriptions to the storage
    sampleSubscriptions.forEach(sub => {
      const id = this.currentSubscriptionId++;
      const subscription: Subscription = { ...sub, id };
      this.subscriptionsMap.set(id, subscription);
      
      // Add some payment history for each subscription
      const today = new Date();
      for (let i = 1; i <= 3; i++) {
        const paymentDate = new Date(today);
        paymentDate.setMonth(today.getMonth() - i);
        
        this.addPaymentHistory({
          subscriptionId: id,
          paymentDate,
          amount: sub.amount,
          currency: sub.currency,
          status: "Paid"
        });
      }
    });
  }

  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentUserId++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Subscription methods
  async getAllSubscriptions(): Promise<Subscription[]> {
    return Array.from(this.subscriptionsMap.values());
  }
  
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptionsMap.get(id);
  }
  
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentSubscriptionId++;
    const newSubscription: Subscription = { ...subscription, id };
    this.subscriptionsMap.set(id, newSubscription);
    return newSubscription;
  }
  
  async updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const existingSubscription = this.subscriptionsMap.get(id);
    
    if (!existingSubscription) {
      return undefined;
    }
    
    const updatedSubscription: Subscription = { 
      ...existingSubscription, 
      ...subscription 
    };
    
    this.subscriptionsMap.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  async deleteSubscription(id: number): Promise<boolean> {
    const deleted = this.subscriptionsMap.delete(id);
    
    // Also delete all payment history for this subscription
    if (deleted) {
      const paymentEntries = Array.from(this.paymentsMap.entries());
      for (const [paymentId, payment] of paymentEntries) {
        if (payment.subscriptionId === id) {
          this.paymentsMap.delete(paymentId);
        }
      }
    }
    
    return deleted;
  }
  
  // Payment history methods
  async getPaymentHistoryBySubscription(subscriptionId: number): Promise<PaymentHistory[]> {
    return Array.from(this.paymentsMap.values())
      .filter(payment => payment.subscriptionId === subscriptionId)
      .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime()); // Newest first
  }
  
  async addPaymentHistory(payment: InsertPaymentHistory): Promise<PaymentHistory> {
    const id = this.currentPaymentId++;
    const newPayment: PaymentHistory = { ...payment, id };
    this.paymentsMap.set(id, newPayment);
    return newPayment;
  }
}

export const storage = new MemStorage();
