import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertSubscriptionSchema } from "@shared/schema";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  // All subscription routes
  app.get("/api/subscriptions", async (req, res) => {
    try {
      const subscriptions = await storage.getAllSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.get("/api/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
      }

      const subscription = await storage.getSubscription(id);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.post("/api/subscriptions", async (req, res) => {
    try {
      const validatedData = insertSubscriptionSchema.parse({
        ...req.body,
        nextPaymentDate: new Date(req.body.nextPaymentDate)
      });
      
      const subscription = await storage.createSubscription(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.patch("/api/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
      }

      // Convert nextPaymentDate string to Date if provided
      let data = { ...req.body };
      if (data.nextPaymentDate) {
        data.nextPaymentDate = new Date(data.nextPaymentDate);
      }

      const subscription = await storage.updateSubscription(id, data);
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      res.json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.delete("/api/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
      }

      const deleted = await storage.deleteSubscription(id);
      if (!deleted) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subscription" });
    }
  });

  // Payment history routes
  app.get("/api/subscriptions/:id/payments", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid subscription ID" });
      }

      const payments = await storage.getPaymentHistoryBySubscription(id);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment history" });
    }
  });

  // Summary statistics
  app.get("/api/summary", async (req, res) => {
    try {
      const subscriptions = await storage.getAllSubscriptions();
      
      // Calculate monthly and yearly totals for active subscriptions
      const activeSubscriptions = subscriptions.filter(sub => sub.status === "Active");
      
      let monthlyTotal = 0;
      let yearlyTotal = 0;
      
      activeSubscriptions.forEach(sub => {
        const amount = sub.amount;
        
        switch (sub.billingCycle) {
          case "Weekly":
            monthlyTotal += amount * 4.33; // Average 4.33 weeks in a month
            yearlyTotal += amount * 52;
            break;
          case "Monthly":
            monthlyTotal += amount;
            yearlyTotal += amount * 12;
            break;
          case "Quarterly":
            monthlyTotal += amount / 3;
            yearlyTotal += amount * 4;
            break;
          case "Yearly":
            monthlyTotal += amount / 12;
            yearlyTotal += amount;
            break;
          default:
            monthlyTotal += amount;
            yearlyTotal += amount * 12;
        }
      });
      
      res.json({
        monthlyTotal: parseFloat(monthlyTotal.toFixed(2)),
        yearlyTotal: parseFloat(yearlyTotal.toFixed(2)),
        activeCount: activeSubscriptions.length,
        pausedCount: subscriptions.length - activeSubscriptions.length,
        totalCount: subscriptions.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate summary" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
