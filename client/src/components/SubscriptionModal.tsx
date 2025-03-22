import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { type Subscription, BillingCycleEnum, StatusEnum, CurrencyEnum } from "@shared/schema";
import { format } from "date-fns";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  currency: z.string().default("AUD"),
  billingCycle: z.string().default("Monthly"),
  nextPaymentDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid date format"
  }),
  status: z.enum(["Active", "Paused"]).default("Active"),
  notes: z.string().optional(),
  icon: z.string().optional(),
  iconColor: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SubscriptionModalProps {
  open: boolean;
  subscription?: Subscription;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => void;
}

export function SubscriptionModal({ 
  open, 
  subscription, 
  onOpenChange, 
  onSubmit 
}: SubscriptionModalProps) {
  const isEditing = !!subscription;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      currency: "AUD",
      billingCycle: "Monthly",
      nextPaymentDate: format(new Date(), "yyyy-MM-dd"),
      status: "Active",
      notes: "",
      icon: "credit-card",
      iconColor: "#3B82F6",
    }
  });
  
  // Reset form with subscription data when editing
  useEffect(() => {
    if (subscription) {
      const nextPaymentDate = subscription.nextPaymentDate instanceof Date
        ? format(subscription.nextPaymentDate, "yyyy-MM-dd")
        : format(new Date(subscription.nextPaymentDate), "yyyy-MM-dd");
        
      form.reset({
        name: subscription.name,
        amount: subscription.amount,
        currency: subscription.currency,
        billingCycle: subscription.billingCycle,
        nextPaymentDate,
        status: subscription.status,
        notes: subscription.notes || "",
        icon: subscription.icon || "credit-card",
        iconColor: subscription.iconColor || "#3B82F6",
      });
    } else if (open) {
      // Reset form when opening for a new subscription
      form.reset({
        name: "",
        amount: 0,
        currency: "AUD", 
        billingCycle: "Monthly",
        nextPaymentDate: format(new Date(), "yyyy-MM-dd"),
        status: "Active",
        notes: "",
        icon: "credit-card",
        iconColor: "#3B82F6",
      });
    }
  }, [subscription, open, form]);
  
  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    form.reset();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Subscription" : "Add Subscription"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Netflix, Spotify, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                          $
                        </span>
                        <Input type="number" step="0.01" className="pl-7" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CurrencyEnum).map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="billingCycle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Cycle</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing cycle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(BillingCycleEnum).map((cycle) => (
                        <SelectItem key={cycle} value={cycle}>
                          {cycle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nextPaymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Payment Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status</FormLabel>
                      <FormDescription>
                        {field.value === "Active" ? "Subscription is active" : "Subscription is paused"}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === "Active"}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? "Active" : "Paused")
                        }
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this subscription..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
