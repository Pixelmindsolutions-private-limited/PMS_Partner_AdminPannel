import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Wallet,
  UserRound,
  BarChart3,
  Bell,
  Settings,
  ChevronDown,
  UserCheck,
  UserCog,
  Clock3,
  Ban,
  Hotel,
  ClipboardCheck,
  CreditCard,
  HandCoins,
  ArrowDownToLine,
  Receipt,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  {
    title: "Partner Management",
    icon: Users,
    children: [
      { title: "All Partners", icon: UserCheck, path: "/partners" },
      { title: "Pending Approvals", icon: Clock3, path: "/partners/pending" },
      { title: "Active Partners", icon: UserCog, path: "/partners/active" },
      { title: "Suspended Partners", icon: Ban, path: "/partners/suspended" },
    ],
  },
  {
    title: "Property Management",
    icon: Building2,
    children: [
      { title: "All Properties", icon: Hotel, path: "/properties" },
      { title: "Property Approvals", icon: ClipboardCheck, path: "/properties/approvals" },
    ],
  },
  {
    title: "Booking Management",
    icon: CalendarCheck,
    children: [
      { title: "All Bookings", icon: Receipt, path: "/bookings" },
      { title: "Pending Bookings", icon: Clock3, path: "/bookings/pending" },
      { title: "Confirmed Bookings", icon: ClipboardCheck, path: "/bookings/confirmed" },
      { title: "Completed Bookings", icon: UserCheck, path: "/bookings/completed" },
      { title: "Cancelled Bookings", icon: Ban, path: "/bookings/cancelled" },
    ],
  },
  {
    title: "Finance",
    icon: Wallet,
    children: [
      { title: "Payments", icon: CreditCard, path: "/payments" },
      { title: "Partner Earnings", icon: HandCoins, path: "/earnings" },
      { title: "Payouts", icon: ArrowDownToLine, path: "/payouts" },
      { title: "Transactions", icon: Receipt, path: "/transactions" },
    ],
  },
  { title: "Customers", icon: UserRound, path: "/customers" },
  { title: "Reports", icon: BarChart3, path: "/reports" },
  { title: "Notifications", icon: Bell, path: "/notifications" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

function Sidebar() {
  const [openMenu, setOpenMenu] = useState("Partner Management");

  const handleMenuClick = (item) => {
    if (item.children) {
      setOpenMenu((current) => (current === item.title ? null : item.title));
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[280px] flex-col bg-[#075d59] text-white shadow-xl">
      <div className="flex h-[92px] items-center border-b border-white/10 px-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#075d59] shadow-sm">
          <Building2 size={25} strokeWidth={2.2} />
        </div>
        <div className="ml-3">
          <h1 className="text-[19px] font-bold tracking-tight">PMS Partner</h1>
          <p className="mt-0.5 text-xs text-white/60">Management Portal</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Main Menu</p>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isOpen = openMenu === item.title;

            if (!item.children) {
              return (
                <NavLink
                  key={item.title}
                  to={item.path}
                  end
                  className={({ isActive }) => `group flex w-full items-center rounded-xl px-3 py-3 text-left transition-all duration-200 ${isActive ? "bg-white/12" : "hover:bg-white/10"}`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.07] transition group-hover:bg-white/15">
                    <Icon size={18} />
                  </span>
                  <span className="ml-3 flex-1 text-[14px] font-medium">{item.title}</span>
                </NavLink>
              );
            }

            return (
              <div key={item.title}>
                <button type="button" onClick={() => handleMenuClick(item)} className="group flex w-full items-center rounded-xl px-3 py-3 text-left transition-all duration-200 hover:bg-white/10">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.07] transition group-hover:bg-white/15">
                    <Icon size={18} />
                  </span>
                  <span className="ml-3 flex-1 text-[14px] font-medium">{item.title}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="ml-7 mt-1 space-y-1 border-l border-white/15 pl-3">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;

                      return (
                        <NavLink
                          key={child.title}
                          to={child.path}
                          className={({ isActive }) => `flex w-full items-center rounded-lg px-3 py-2.5 text-left text-[13px] transition ${isActive ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"}`}
                        >
                          <ChildIcon size={15} />
                          <span className="ml-2.5">{child.title}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-center text-[11px] tracking-wide text-white/40">PMS • Partner Management System</p>
      </div>
    </aside>
  );
}

export default Sidebar;