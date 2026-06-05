import { User, Shield, Settings, Bell, LogOut } from "lucide-react";
import type { ProfileTab } from "../../hooks/useUserProfile.ts";
import { cn } from "../../lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "../ui/sidebar";

const NAV = [
  { id: "account", label: "Account", icon: User },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;

type Props = {
  activeTab: ProfileTab;
  setActiveTab: (tab: ProfileTab) => void;
  onLogout: () => void;
};

export default function ProfileSidebar({
  activeTab,
  setActiveTab,
  onLogout,
}: Props) {
  return (
    <Sidebar
      collapsible="none"
      className="!static self-stretch border-r border-[#064E3B]/10 shrink-0 bg-[#064E3B] text-slate-100 h-full overflow-hidden z-20"
    >
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-slate-350 text-[10px] uppercase font-black tracking-widest mb-3 font-body">
            Profile Settings
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1.5 px-2">
            {NAV.map(({ id, label, icon: IconComponent }) => {
              const isActive = activeTab === id;
              return (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 font-body",
                      isActive
                            ? "bg-[#EAB308] text-[#064E3B] font-extrabold shadow-md"
                            : "hover:bg-[#043E2F] text-slate-200 hover:text-white"
                    )}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-[#043E2F]/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 font-body text-red-300 hover:!bg-red-950/30 hover:!text-red-200"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}