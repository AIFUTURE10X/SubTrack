import * as React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: React.ReactNode;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const [location] = useLocation();
  
  return (
    <nav className={cn("flex flex-col gap-2", className)} {...props}>
      {items.map((item) => {
        const isActive = location === item.href;
        
        return (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-primary/10 text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {item.icon}
              {item.title}
            </a>
          </Link>
        );
      })}
    </nav>
  );
}
