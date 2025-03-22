import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Subscription, type InsertSubscription } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useSubscriptions() {
  const queryClient = useQueryClient();
  
  // Get all subscriptions
  const subscriptionsQuery = useQuery<Subscription[]>({
    queryKey: ['/api/subscriptions'],
  });
  
  // Get subscription summary
  const summaryQuery = useQuery<{
    monthlyTotal: number;
    yearlyTotal: number;
    activeCount: number;
    pausedCount: number;
    totalCount: number;
  }>({
    queryKey: ['/api/summary'],
  });
  
  // Get payment history for a subscription
  const usePaymentHistory = (subscriptionId: number | null) => {
    return useQuery<any[]>({
      queryKey: ['/api/subscriptions', subscriptionId, 'payments'],
      enabled: !!subscriptionId,
    });
  };
  
  // Create a new subscription
  const createSubscriptionMutation = useMutation({
    mutationFn: async (subscription: InsertSubscription) => {
      const res = await apiRequest('POST', '/api/subscriptions', subscription);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
    },
  });
  
  // Update an existing subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSubscription> }) => {
      const res = await apiRequest('PATCH', `/api/subscriptions/${id}`, data);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
    },
  });
  
  // Delete a subscription
  const deleteSubscriptionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/subscriptions/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
    },
  });
  
  return {
    subscriptions: subscriptionsQuery.data || [],
    summary: summaryQuery.data,
    isLoading: subscriptionsQuery.isLoading || summaryQuery.isLoading,
    isError: subscriptionsQuery.isError || summaryQuery.isError,
    usePaymentHistory,
    createSubscription: createSubscriptionMutation.mutate,
    updateSubscription: updateSubscriptionMutation.mutate,
    deleteSubscription: deleteSubscriptionMutation.mutate,
    isPending: 
      createSubscriptionMutation.isPending || 
      updateSubscriptionMutation.isPending || 
      deleteSubscriptionMutation.isPending
  };
}
