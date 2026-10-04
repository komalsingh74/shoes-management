import type { ReactNode } from "react";
// import { Bell, Search } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { Search, Bell, Command, ChevronDown } from "lucide-react";


export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
<header className="sticky top-0 z-40 h-16 w-full border-b border-slate-200/80 bg-white/75 backdrop-blur-md transition-all">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        
        {/* Left Side: Modern Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="group relative flex items-center">
            <Search 
              size={18} 
              className="absolute left-3.5 text-slate-400 transition-colors group-focus-within:text-orange-500" 
            />
            <input
              type="search"
              placeholder="Search orders, customers, products..."
              aria-label="Search"
              className="w-full h-10 rounded-xl border border-slate-200/80 bg-slate-50/80 pl-10 pr-12 text-sm text-slate-900 
                placeholder:text-slate-400 outline-none transition-all duration-200
                hover:bg-slate-100/60
                focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
            {/* Keyboard Shortcut Indicator */}
            <div className="absolute right-3 hidden sm:flex items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 shadow-2xs pointer-events-none">
              <Command size={10} />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right Side: Actions & Profile */}
        <div className="flex items-center gap-3">
          
          {/* Notification Button with Animated Badge */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-all duration-200
              hover:bg-slate-100 hover:text-slate-900 active:scale-95
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            <Bell size={20} />
            {/* Ping animation + static dot */}
            <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
            </span>
          </button>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200" aria-hidden="true" />

          {/* User Profile Section */}
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl p-1.5 transition-all duration-200
              hover:bg-slate-100/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop"
                alt="User Avatar"
                className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
              />
              {/* Online Status Dot */}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">Alex Morgan</span>
              <span className="text-[11px] text-slate-400 leading-tight">Admin</span>
            </div>

            <ChevronDown size={14} className="hidden sm:block text-slate-400" />
          </button>

        </div>

      </div>
    </header>

        {/* Page content */}
        <main className="flex-1 p-0">{children}</main>
      </div>
    </div>
  );
}