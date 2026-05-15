
"use client";

import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DashboardPageFrameProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  controls?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'admin' | 'courier' | 'umkm';
}

/**
 * VIEW (MVC): Dashboard Page Frame
 * Bingkai standar untuk seluruh halaman dashboard agar tata letak konsisten, 
 * tidak "bablas", dan mendukung efek scroll di bawah frame.
 */
export function DashboardPageFrame({ 
  title, 
  subtitle, 
  icon: Icon, 
  controls, 
  children,
  className,
  variant = 'default'
}: DashboardPageFrameProps) {
  
  const variantStyles = {
    default: "text-primary border-primary/10",
    admin: "text-purple-600 border-purple-100 bg-purple-50/10",
    courier: "text-green-600 border-green-100 bg-green-50/10",
    umkm: "text-orange-600 border-orange-100 bg-orange-50/10",
  };

  return (
    <div className="flex flex-col h-full w-full max-w-full overflow-hidden">
      {/* STICKY HEADER VIEW */}
      <div className="sticky top-0 z-20 bg-[#F8FAFC]/95 backdrop-blur-md px-4 py-4 shrink-0 border-b">
        <div className={cn("bg-white p-4 rounded-2xl border shadow-sm space-y-3", variantStyles[variant])}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-black uppercase leading-tight tracking-tighter flex items-center gap-2">
                <Icon className="h-5 w-5 shrink-0" /> 
                <span className="truncate">{title}</span>
              </h1>
              <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-[0.2em] mt-1 opacity-70 truncate">
                {subtitle}
              </p>
            </div>
          </div>
          {/* CONTROLLER CONTROLS AREA */}
          {controls && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-300">
              {controls}
            </div>
          )}
        </div>
      </div>

      {/* DATA VIEW AREA */}
      <ScrollArea className="flex-1">
        <div className={cn("px-4 py-4 pb-32 space-y-4", className)}>
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}
