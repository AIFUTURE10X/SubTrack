import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Edit, 
  Pause, 
  Play, 
  Info, 
  Trash2,
  CreditCard,
  Youtube,
  Bot,
  Film,
  Phone,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { type Subscription } from "@shared/schema";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FaYoutube } from "react-icons/fa";

interface SubscriptionCardProps {
  subscription: Subscription;
  isSelected?: boolean;
  onEdit: (subscription: Subscription) => void;
  onToggleStatus: (subscription: Subscription) => void;
  onDetails: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'youtube':
      return <FaYoutube className="h-4 w-4 text-red-500" />;
    case 'robot':
      return <Bot className="h-4 w-4 text-blue-400" />;
    case 'film':
      return <Film className="h-4 w-4 text-red-600" />;
    case 'mobile-alt':
      return <Phone className="h-4 w-4 text-green-400" />;
    default:
      return <CreditCard className="h-4 w-4 text-primary" />;
  }
};

export function SubscriptionCard({
  subscription,
  isSelected = false,
  onEdit,
  onToggleStatus,
  onDetails,
  onDelete,
}: SubscriptionCardProps) {
  const { id, name, amount, currency, nextPaymentDate, status, icon, iconColor } = subscription;
  
  const isActive = status === 'Active';
  
  return (
    <Card 
      className={cn(
        "subscription-card overflow-hidden transition-all hover:translate-y-[-2px] duration-200",
        isSelected ? "border-primary" : "hover:border-primary"
      )}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            {getIcon(icon || 'credit-card')}
            <h3 className="text-foreground font-medium ml-2">{name}</h3>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              isActive 
                ? "bg-green-500/20 text-green-500 border-green-500/10" 
                : "bg-amber-500/20 text-amber-500 border-amber-500/10"
            )}
          >
            <span 
              className={cn(
                "w-2 h-2 rounded-full", 
                isActive ? "bg-green-500" : "bg-amber-500"
              )} 
            />
            {status}
          </Badge>
        </div>
        
        <div className="mt-2">
          <div className="text-2xl font-semibold text-foreground">
            {formatCurrency(amount, currency)} 
            <span className="text-sm text-muted-foreground ml-1">{currency}</span>
          </div>
          <div className="flex items-center mt-1 text-muted-foreground text-sm">
            <Info className="h-3 w-3 mr-1" />
            <span>
              {isActive 
                ? `Next payment: ${formatDate(nextPaymentDate)}` 
                : `Paused since: ${formatDate(nextPaymentDate)}`}
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border flex justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            title="Edit"
            onClick={() => onEdit(subscription)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            title={isActive ? "Pause" : "Resume"}
            onClick={() => onToggleStatus(subscription)}
          >
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            title="Details"
            onClick={() => onDetails(subscription)}
          >
            <Info className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            title="Delete"
            className="hover:text-destructive"
            onClick={() => onDelete(subscription)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AddSubscriptionCard({ onClick }: { onClick: () => void }) {
  return (
    <Card className="subscription-card border-dashed border-2 bg-muted/20 hover:border-primary transition-colors overflow-hidden">
      <Button 
        variant="ghost"
        className="w-full h-full py-8 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary"
        onClick={onClick}
      >
        <span className="rounded-full bg-muted p-2">
          <Plus className="h-5 w-5" />
        </span>
        <span className="text-sm font-medium">Add New Subscription</span>
      </Button>
    </Card>
  );
}

function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
