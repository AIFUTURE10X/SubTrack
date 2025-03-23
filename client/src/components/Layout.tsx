import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  BarChart2, 
  History, 
  Settings, 
  Menu
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Reminders } from "@/components/Reminders";
import { Subscription } from "@shared/schema";
import { DetailsModal } from "@/components/DetailsModal";

interface LayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_ITEMS = [
  {
    title: "Dashboard",
    href: "/",
    icon: <Home className="h-4 w-4" />,
  },
  {
    title: "Statistics",
    href: "/statistics",
    icon: <BarChart2 className="h-4 w-4" />,
  },
  {
    title: "History",
    href: "/history",
    icon: <History className="h-4 w-4" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-4 w-4" />,
  },
];

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | undefined>(undefined);

  const handleOpenDetails = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setDetailsModalOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-sidebar border-r border-border">
        <div className="p-4 flex items-center">
          <Logo size="sm" showText={false} />
          <h1 className="text-xl font-semibold text-sidebar-foreground ml-2">SubTrack</h1>
        </div>
        
        <div className="flex-1 p-4">
          <SidebarNav items={SIDEBAR_ITEMS} />
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground">John Doe</span>
              <span className="text-xs text-muted-foreground">john@example.com</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between border-b border-border p-4">
          <div>
            <h1 className="text-xl font-medium">{getPageTitle(location)}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Reminders onDetails={handleOpenDetails} />
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden w-full fixed top-0 z-10 bg-card border-b border-border px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Logo size="sm" showText={false} />
              <h1 className="text-lg font-semibold text-card-foreground ml-2">SubTrack</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Reminders onDetails={handleOpenDetails} />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 bg-sidebar">
                  <div className="p-4 flex items-center border-b border-border">
                    <Logo size="sm" showText={false} />
                    <h1 className="text-lg font-semibold text-sidebar-foreground ml-2">SubTrack</h1>
                  </div>
                  
                  <div className="p-4">
                    <SidebarNav items={SIDEBAR_ITEMS} />
                  </div>
                  
                  <div className="p-4 border-t border-border absolute bottom-0 w-full">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-sidebar-foreground">John Doe</span>
                        <span className="text-xs text-muted-foreground">john@example.com</span>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-0 md:pt-0">
          <div className="md:max-w-6xl mx-auto p-4 md:p-6 pt-16 md:pt-6">
            {children}
          </div>
        </main>
      </div>

      {/* Details Modal */}
      <DetailsModal
        open={detailsModalOpen}
        subscription={selectedSubscription}
        onOpenChange={setDetailsModalOpen}
        onEdit={() => {
          // For now, just close the modal since we can't directly access the Dashboard edit function
          setDetailsModalOpen(false);
        }}
      />
    </div>
  );
}

// Helper to get the page title based on location
function getPageTitle(location: string): string {
  switch (location) {
    case '/':
      return 'Dashboard';
    case '/statistics':
      return 'Statistics';
    case '/history':
      return 'Payment History';
    case '/settings':
      return 'Settings';
    default:
      return 'SubTrack';
  }
}
