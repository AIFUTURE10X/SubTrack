import React, { useState, useEffect } from 'react';
import { Bell, X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, getUpcomingReminders } from '@/lib/utils';
import { Subscription } from '@shared/schema';
import { formatCurrency } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSubscriptions } from '@/hooks/useSubscriptions';

interface RemindersProps {
  onDetails: (subscription: Subscription) => void;
}

export function Reminders({ onDetails }: RemindersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnreadReminders, setHasUnreadReminders] = useState(false);
  const { subscriptions } = useSubscriptions();
  
  // Get upcoming reminders
  const { dueTomorrow, dueInThreeDays } = getUpcomingReminders(subscriptions);
  const hasReminders = dueTomorrow.length > 0 || dueInThreeDays.length > 0;
  
  // Check for unread reminders
  useEffect(() => {
    if (hasReminders) {
      setHasUnreadReminders(true);
    }
  }, [hasReminders, dueTomorrow.length, dueInThreeDays.length]);
  
  // Handle opening the reminders panel
  const handleOpenReminders = () => {
    setIsOpen(true);
    setHasUnreadReminders(false);
  };
  
  // If there are no reminders, return just the bell icon
  if (!hasReminders) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative" 
        onClick={handleOpenReminders}
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
      </Button>
    );
  }
  
  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative" 
        onClick={handleOpenReminders}
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {hasUnreadReminders && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        )}
      </Button>
      
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-[350px] z-50 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Upcoming Payments</CardTitle>
              <CardDescription>Payment reminders for your subscriptions</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {dueTomorrow.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-sm flex items-center gap-1 mb-2 text-red-500">
                    <AlertCircle className="h-4 w-4" /> Due Tomorrow
                  </h3>
                  <div className="space-y-3">
                    {dueTomorrow.map((subscription) => (
                      <ReminderItem 
                        key={subscription.id} 
                        subscription={subscription} 
                        onDetails={onDetails}
                        onClose={() => setIsOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {dueInThreeDays.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm flex items-center gap-1 mb-2 text-amber-500">
                    <Clock className="h-4 w-4" /> Due in 3 Days
                  </h3>
                  <div className="space-y-3">
                    {dueInThreeDays.map((subscription) => (
                      <ReminderItem 
                        key={subscription.id} 
                        subscription={subscription} 
                        onDetails={onDetails}
                        onClose={() => setIsOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ReminderItemProps {
  subscription: Subscription;
  onDetails: (subscription: Subscription) => void;
  onClose: () => void;
}

function ReminderItem({ subscription, onDetails, onClose }: ReminderItemProps) {
  return (
    <div 
      className="p-3 bg-muted rounded-md hover:bg-muted/80 cursor-pointer transition-colors"
      onClick={() => {
        onDetails(subscription);
        onClose();
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{subscription.name}</h4>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(subscription.nextPaymentDate)}
          </div>
        </div>
        <span className="font-medium">
          {formatCurrency(subscription.amount, subscription.currency)}
        </span>
      </div>
    </div>
  );
}