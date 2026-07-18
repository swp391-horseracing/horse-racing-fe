import * as React from "react";
import { Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface SidebarDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  triggerClassName?: string;
}

export function SidebarDrawer({
  isOpen,
  onOpenChange,
  title = "Menu",
  children,
  triggerClassName,
}: SidebarDrawerProps) {
  return (
    <>
      {/* Floating half-circle pull tab */}
      <button
        onClick={() => onOpenChange(true)}
        className={cn(
          "lg:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-9 h-16 bg-card text-primary border border-border border-l-0 shadow-xl rounded-r-full hover:w-11 hover:bg-primary/5 transition-all duration-200",
          triggerClassName
        )}
        aria-label={`Open ${title}`}
      >
        <Menu className="h-4 w-4 shrink-0" />
      </button>

      {/* Mobile drawer overlay — always in DOM for smooth CSS transitions */}
      <div
        aria-hidden={!isOpen}
        inert={!isOpen || undefined}
        className={cn(
          "lg:hidden fixed inset-0 z-50 flex transition-all duration-300",
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => onOpenChange(false)}
        />
        {/* Drawer panel */}
        <div
          className={cn(
            "relative z-10 w-[85vw] max-w-sm h-full bg-background shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card">
            <span className="text-sm font-black text-primary uppercase tracking-wider">
              {title}
            </span>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg border border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close drawer</span>
            </button>
          </div>
          {/* Drawer content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
