import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Subscription, PaymentHistory } from "@shared/schema";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { Edit } from "lucide-react";

interface DetailsModalProps {
  open: boolean;
  subscription?: Subscription;
  onOpenChange: (open: boolean) => void;
  onEdit: (subscription: Subscription) => void;
}

export function DetailsModal({
  open,
  subscription,
  onOpenChange,
  onEdit,
}: DetailsModalProps) {
  const { usePaymentHistory } = useSubscriptions();
  
  const { data: paymentHistory, isLoading: isLoadingPayments } = usePaymentHistory(
    open && subscription ? subscription.id : null
  );
  
  if (!open || !subscription) {
    return null;
  }
  
  const isActive = subscription.status === "Active";
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{subscription.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-muted-foreground text-sm">Amount</h4>
                <p className="text-foreground text-xl font-semibold">
                  {formatCurrency(subscription.amount, subscription.currency)} {subscription.currency}
                </p>
              </div>
              <div>
                <h4 className="text-muted-foreground text-sm">Status</h4>
                <Badge 
                  variant="outline" 
                  className={
                    isActive 
                      ? "bg-green-500/20 text-green-500 border-green-500/10" 
                      : "bg-amber-500/20 text-amber-500 border-amber-500/10"
                  }
                >
                  <span 
                    className={`w-2 h-2 rounded-full mr-1 ${isActive ? "bg-green-500" : "bg-amber-500"}`} 
                  />
                  {subscription.status}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-4">
              <h4 className="text-muted-foreground text-sm">Billing Cycle</h4>
              <p className="text-foreground">{subscription.billingCycle}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <h4 className="text-muted-foreground text-sm">
                {isActive ? "Next Payment" : "Paused Since"}
              </h4>
              <p className="text-foreground">{formatDate(subscription.nextPaymentDate)}</p>
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <h4 className="text-muted-foreground text-sm mb-2">Payment History</h4>
            {isLoadingPayments ? (
              <p className="text-sm text-muted-foreground">Loading payment history...</p>
            ) : !paymentHistory || paymentHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payment history available</p>
            ) : (
              <ScrollArea className="h-[120px]">
                <div className="space-y-2">
                  {paymentHistory.map((payment: PaymentHistory) => (
                    <div key={payment.id} className="flex justify-between text-sm">
                      <span className="text-foreground">{formatDate(payment.paymentDate)}</span>
                      <span className="text-foreground">
                        {formatCurrency(payment.amount, payment.currency)} {payment.currency}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          
          {subscription.notes && (
            <div className="bg-muted rounded-lg p-4">
              <h4 className="text-muted-foreground text-sm mb-2">Notes</h4>
              <p className="text-foreground text-sm">{subscription.notes}</p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              onEdit(subscription);
              onOpenChange(false);
            }}
          >
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
