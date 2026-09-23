import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNavbar from "./MobileNavbar";
import MobileDrawer from "./MobileDrawer";

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-mist-50">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col pb-16 lg:pb-0">
        <Outlet />
      </div>
      <MobileNavbar onOpenMenu={() => setDrawerOpen(true)} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
