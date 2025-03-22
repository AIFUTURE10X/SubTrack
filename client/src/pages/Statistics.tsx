import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, DollarSign, TrendingUp, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

export default function Statistics() {
  const { data: subscriptions, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ['/api/subscriptions'],
  });
  
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['/api/summary'],
  });
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground mt-2">View your subscription spending analytics</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard 
          title="Monthly Spend" 
          value={summary?.monthlyTotal ?? 0} 
          description="Current monthly total" 
          icon={<DollarSign className="w-5 h-5" />}
          isLoading={isLoadingSummary}
          prefix="$"
        />
        <StatCard 
          title="Yearly Projection" 
          value={summary?.yearlyTotal ?? 0} 
          description="Projected annual spend" 
          icon={<TrendingUp className="w-5 h-5" />}
          isLoading={isLoadingSummary}
          prefix="$"
        />
        <StatCard 
          title="Active Subscriptions" 
          value={summary?.activeCount ?? 0} 
          description="Current active services" 
          icon={<BarChart2 className="w-5 h-5" />}
          isLoading={isLoadingSummary}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Monthly spending trend</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">Analytics feature coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Category breakdown</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">Analytics feature coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  isLoading?: boolean;
  prefix?: string;
  suffix?: string;
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  isLoading = false,
  prefix = '',
  suffix = '' 
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              {prefix}{value.toFixed(2)}{suffix}
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <>
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-xs text-green-500">+2.5%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-xs text-red-500">-3.2%</span>
              </>
            )}
            <span className="text-xs text-muted-foreground ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}