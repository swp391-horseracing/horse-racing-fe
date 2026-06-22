import { Outlet } from "react-router-dom";
import UserLayout from "../layouts/UserLayout";

export default function SpectatorPage() {
  return (
    <UserLayout>
      <div className="h-full w-full relative flex flex-col overflow-hidden bg-[#F4F6F5]">
        <div className="flex-1 overflow-y-auto min-h-0">
          <Outlet />
        </div>
      </div>
    </UserLayout>
  );
}
