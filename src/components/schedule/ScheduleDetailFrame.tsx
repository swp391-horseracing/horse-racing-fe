import React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface TabConfig<T extends string> {
  key: T;
  label: string;
  icon?: React.ReactNode;
}

interface ScheduleDetailFrameProps<T extends string> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerRight?: React.ReactNode;
  headerClass?: string;
  onClose: () => void;
  tabs?: TabConfig<T>[];
  activeTab?: T;
  onTabChange?: (tab: T) => void;
  children: React.ReactNode;
  bannerSlot?: React.ReactNode;
  closeButtonClass?: string;
  containerClass?: string;
}

export function ScheduleDetailFrame<T extends string>({
  title,
  subtitle,
  headerRight,
  headerClass = "bg-[#01251e] text-white border-b border-[#064E3B]/10",
  onClose,
  tabs,
  activeTab,
  onTabChange,
  children,
  bannerSlot,
  closeButtonClass = "bg-white/20 hover:bg-white/30 text-white border-white/30",
  containerClass = "border-slate-200 bg-white shadow-sm",
}: ScheduleDetailFrameProps<T>) {
  return (
    <div
      className={cn(
        "overflow-hidden border bg-white rounded-2xl flex flex-col min-h-[480px] lg:sticky lg:top-0 animate-in fade-in slide-in-from-right-8 duration-200",
        containerClass
      )}
    >
      {/* Dynamic Header Block */}
      <div className={cn("relative p-6", headerClass)}>
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {title}
            {subtitle}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {headerRight}
            <button
              onClick={onClose}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-xl transition-all shadow-sm active:scale-95 border",
                closeButtonClass
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {bannerSlot && <div className="mt-4">{bannerSlot}</div>}
      </div>

      {/* Tab Switcher */}
      {tabs && tabs.length > 0 && activeTab && onTabChange && (
        <div className="flex border-b border-slate-100 bg-[#F4F6F5]/40">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition-all border-b-2",
                activeTab === tab.key
                  ? "border-[#064E3B] text-[#064E3B] bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/50"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Inner Children Elements */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>
    </div>
  );
}
