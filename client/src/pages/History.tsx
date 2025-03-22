import React from 'react';
import { Layout } from '@/components/Layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Subscription } from '@shared/schema';

export default function History() {
  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ['/api/subscriptions'],
  });
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground mt-2">Track all your subscription payments</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Recent Payments
          </CardTitle>
          <CardDescription>View your recent subscription payments and status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : subscriptions && subscriptions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions && subscriptions.slice(0, 10).map((subscription: Subscription, i: number) => (
                  <TableRow key={`${subscription.id}-${i}`}>
                    <TableCell className="font-medium">{subscription.name}</TableCell>
                    <TableCell>{formatDate(new Date(Date.now() - i * 1000 * 60 * 60 * 24 * 7))}</TableCell>
                    <TableCell>{formatCurrency(subscription.amount, subscription.currency)}</TableCell>
                    <TableCell>
                      <PaymentStatus status={i % 5 === 0 ? 'failed' : 'successful'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <CreditCard className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No payment history yet</h3>
              <p className="text-muted-foreground mt-2">
                Your payment history will appear here once payments have been processed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center">
        <p className="text-muted-foreground text-sm">
          Note: Full payment history functionality coming soon!
        </p>
      </div>
    </Layout>
  );
}

function PaymentStatus({ status }: { status: 'successful' | 'pending' | 'failed' }) {
  if (status === 'successful') {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
        <CheckCircle className="mr-1 h-3 w-3" />
        Successful
      </Badge>
    );
  }
  
  if (status === 'pending') {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center">
        <span className="mr-1 h-2 w-2 rounded-full bg-yellow-500"></span>
        Pending
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center">
      <XCircle className="mr-1 h-3 w-3" />
      Failed
    </Badge>
  );
}