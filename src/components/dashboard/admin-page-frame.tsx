
"use client";

import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AdminPageFrameProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  controls?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * VIEW: Dashboard Page Frame (Standardized)
 * Komponen ini adalah "Bingkai Impian" yang menjamin konsistensi layout.
 * Menangani margin horizontal (px-4) dan efek sticky header secara terpusat.
 */
export function AdminPageFrame({ 
  title, 
  subtitle, 
  icon: Icon, 
  controls, 
  children,
  className 
}: AdminPageFrameProps) {
  return (
    <div className="flex flex-col h-full w-full max-w-full overflow-hidden">
      {/* STICKY HEADER FRAME */}
      <div className="sticky top-0 z-20 bg-[#F8FAFC]/95 backdrop-blur-md px-4 py-4 shrink-0 border-b">
        <div className="bg-white p-4 rounded-xl border border-primary/10 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-black text-primary uppercase leading-tight tracking-tighter flex items-center gap-2">
                <Icon className="h-5 w-5 shrink-0" /> 
                <span className="truncate">{title}</span>
              </h1>
              <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-[0.2em] mt-1 opacity-70 truncate">
                {subtitle}
              </p>
            </div>
          </div>
          {/* AREA UNTUK SEARCH, FILTER, & TOMBOL AKSI */}
          {controls && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-300">
              {controls}
            </div>
          )}
        </div>
      </div>

      {/* SCROLLABLE DATA CONTENT */}
      <ScrollArea className="flex-1">
        <div className={cn("px-4 py-4 pb-32 space-y-4", className)}>
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}
