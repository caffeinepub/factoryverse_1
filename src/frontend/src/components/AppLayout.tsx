import { Bell, Menu, Search } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { session } = useAuth();

  const initials = session?.companyName?.slice(0, 2).toUpperCase() ?? "FV";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border h-14 flex items-center px-4 gap-4 flex-shrink-0 shadow-xs">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
            data-ocid="nav.hamburger.button"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground"
                placeholder="Ara..."
                data-ocid="header.search_input"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {title && (
              <span className="hidden md:block text-sm font-medium text-muted-foreground">
                {title}
              </span>
            )}
            <button
              type="button"
              className="relative text-muted-foreground hover:text-foreground"
              data-ocid="header.bell.button"
            >
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
