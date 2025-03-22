import { useState, useEffect } from "react";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { Layout } from "@/components/Layout";
import { SubscriptionCard, AddSubscriptionCard } from "@/components/SubscriptionCard";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { DetailsModal } from "@/components/DetailsModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Subscription, StatusEnum } from "@shared/schema";
import { Search, Plus } from "lucide-react";

export default function Dashboard() {
  const { 
    subscriptions, 
    summary, 
    isLoading, 
    createSubscription, 
    updateSubscription, 
    deleteSubscription, 
    isPending 
  } = useSubscriptions();
  
  const { toast } = useToast();
  
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  
  // State for modals
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>(undefined);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | undefined>(undefined);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | undefined>(undefined);
  
  // Filtered and sorted subscriptions
  const filteredSubscriptions = subscriptions
    .filter(sub => {
      // Apply search filter
      const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply status filter
      const matchesStatus = statusFilter === "All" || sub.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "amountAsc":
          return a.amount - b.amount;
        case "amountDesc":
          return b.amount - a.amount;
        case "nextPayment":
          return new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime();
        default:
          return 0;
      }
    });
  
  // Handle subscription form submission
  const handleSubscriptionSubmit = (data: any) => {
    const formattedData = {
      ...data,
      amount: parseFloat(data.amount),
      nextPaymentDate: new Date(data.nextPaymentDate),
    };
    
    if (editingSubscription) {
      // Update existing subscription
      updateSubscription({
        id: editingSubscription.id,
        data: formattedData
      }, {
        onSuccess: () => {
          toast({
            title: "Subscription updated",
            description: `${formattedData.name} has been updated successfully.`,
          });
          setSubscriptionModalOpen(false);
          setEditingSubscription(undefined);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to update subscription: ${error}`,
            variant: "destructive",
          });
        }
      });
    } else {
      // Create new subscription
      createSubscription(formattedData, {
        onSuccess: () => {
          toast({
            title: "Subscription added",
            description: `${formattedData.name} has been added successfully.`,
          });
          setSubscriptionModalOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: `Failed to add subscription: ${error}`,
            variant: "destructive",
          });
        }
      });
    }
  };
  
  // Handle subscription status toggle
  const handleToggleStatus = (subscription: Subscription) => {
    const newStatus = subscription.status === "Active" ? "Paused" : "Active";
    
    updateSubscription({
      id: subscription.id,
      data: { status: newStatus }
    }, {
      onSuccess: () => {
        toast({
          title: `Subscription ${newStatus.toLowerCase()}`,
          description: `${subscription.name} has been ${newStatus.toLowerCase()}.`,
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update status: ${error}`,
          variant: "destructive",
        });
      }
    });
  };
  
  // Handle subscription deletion
  const handleDelete = () => {
    if (!subscriptionToDelete) return;
    
    deleteSubscription(subscriptionToDelete.id, {
      onSuccess: () => {
        toast({
          title: "Subscription deleted",
          description: `${subscriptionToDelete.name} has been deleted.`,
        });
        setDeleteDialogOpen(false);
        setSubscriptionToDelete(undefined);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to delete subscription: ${error}`,
          variant: "destructive",
        });
      }
    });
  };
  
  return (
    <Layout>
      {/* Header & Summary */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Subscriptions</h1>
            <p className="text-muted-foreground mt-1">Track and manage your recurring expenses</p>
          </div>
          
          {/* Summary Cards */}
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            {isLoading ? (
              <>
                <Skeleton className="h-[74px] w-full md:w-[200px]" />
                <Skeleton className="h-[74px] w-full md:w-[200px]" />
              </>
            ) : (
              <>
                <div className="bg-card rounded-lg p-3 w-full md:w-auto">
                  <p className="text-muted-foreground text-sm">Monthly Total</p>
                  <p className="text-foreground text-xl font-semibold">
                    {summary?.monthlyTotal
                      ? formatCurrency(summary.monthlyTotal, "AUD")
                      : "$0.00"} AUD
                  </p>
                </div>
                <div className="bg-card rounded-lg p-3 w-full md:w-auto">
                  <p className="text-muted-foreground text-sm">Yearly Total</p>
                  <p className="text-foreground text-xl font-semibold">
                    {summary?.yearlyTotal
                      ? formatCurrency(summary.yearlyTotal, "AUD")
                      : "$0.00"} AUD
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-2">
          <div className="relative rounded-md w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              type="text"
              className="pl-10"
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Paused">Paused</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by name</SelectItem>
              <SelectItem value="amountAsc">Price: Low to High</SelectItem>
              <SelectItem value="amountDesc">Price: High to Low</SelectItem>
              <SelectItem value="nextPayment">Next payment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          className="flex items-center gap-2" 
          onClick={() => {
            setEditingSubscription(undefined);
            setSubscriptionModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span>Add Subscription</span>
        </Button>
      </div>
      
      {/* Subscription List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-[200px] w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              isSelected={selectedSubscription?.id === subscription.id}
              onEdit={(sub) => {
                setEditingSubscription(sub);
                setSubscriptionModalOpen(true);
              }}
              onToggleStatus={handleToggleStatus}
              onDetails={(sub) => {
                setSelectedSubscription(sub);
                setDetailsModalOpen(true);
              }}
              onDelete={(sub) => {
                setSubscriptionToDelete(sub);
                setDeleteDialogOpen(true);
              }}
            />
          ))}
          
          <AddSubscriptionCard 
            onClick={() => {
              setEditingSubscription(undefined);
              setSubscriptionModalOpen(true);
            }} 
          />
        </div>
      )}
      
      {/* Add/Edit Subscription Modal */}
      <SubscriptionModal
        open={subscriptionModalOpen}
        subscription={editingSubscription}
        onOpenChange={setSubscriptionModalOpen}
        onSubmit={handleSubscriptionSubmit}
      />
      
      {/* Subscription Details Modal */}
      <DetailsModal
        open={detailsModalOpen}
        subscription={selectedSubscription}
        onOpenChange={setDetailsModalOpen}
        onEdit={(sub) => {
          setEditingSubscription(sub);
          setSubscriptionModalOpen(true);
        }}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subscription "{subscriptionToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
