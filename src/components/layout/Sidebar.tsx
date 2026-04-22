import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Archive,
  Wallet,
  Layers,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import avatar from "@/assets/avatar.jpg";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/inventory", label: "Inventory", icon: Archive },
  { to: "/sales", label: "Sales", icon: Wallet },
  { to: "/batches", label: "Batches", icon: Layers },
  { to: "/reports", label: "Reports", icon: BarChart3 },
] as const;

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
    onClose();
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  // Format role for display
  const formatRole = (role?: string) => {
    if (!role) return "User";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <>
      {open && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={[
          "fixed lg:sticky top-0 z-50 lg:z-10 h-screen w-72 shrink-0",
          "bg-sidebar text-sidebar-foreground border-r border-border/60",
          "flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-7 pt-8 pb-10">
          <div>
            <h1 className="font-serif text-2xl leading-tight tracking-tight">
              Heritage
              <br />
              Curator
            </h1>
            <p className="mt-2 text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
              Premium Date Ledger
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden rounded-md p-2 hover:bg-accent"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={[
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium tracking-wide uppercase transition-colors",
                  active
                    ? "bg-card text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50",
                ].join(" ")}
              >
                <Icon className={["h-4 w-4", active ? "text-olive" : "text-olive/70"].join(" ")} />
                <span className="text-xs tracking-[0.18em]">{item.label}</span>
                {active && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-l-full bg-gold" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-4 space-y-1 border-t border-border/60 pt-4">
          <Link
            to="/settings"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:bg-card/50"
          >
            <Settings className="h-4 w-4 text-olive/70" /> Settings
          </Link>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:bg-card/50">
            <HelpCircle className="h-4 w-4 text-olive/70" /> Support
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:bg-card/50 hover:text-red-500"
          >
            <LogOut className="h-4 w-4 text-olive/70" /> Logout
          </button>

          {/* User Profile Card */}
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-card p-3 shadow-card">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{getUserInitials()}</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" title={user?.name}>
                {user?.name || "User"}
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {formatRole(user?.role)}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
