import { Bell, History, Search, Menu, Plus } from "lucide-react";
import avatar from "@/assets/avatar.jpg";

export function Topbar({ onMenu, action = "Point of Sale" }: { onMenu: () => void; action?: string }) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-10 h-20">
        <button
          onClick={onMenu}
          className="lg:hidden rounded-lg p-2 hover:bg-accent"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <p className="hidden md:block font-serif italic text-lg text-foreground/80 mr-2">
          The Vault
        </p>

        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search the archives..."
              className="w-full h-11 rounded-full bg-card pl-11 pr-4 text-sm placeholder:text-muted-foreground border border-border/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent relative" aria-label="Notifications">
            <Bell className="h-5 w-5 text-foreground/70" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <button className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-accent" aria-label="History">
            <History className="h-5 w-5 text-foreground/70" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 sm:px-5 h-11 text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] hover:bg-primary/90 transition shadow-soft">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{action}</span>
            <span className="sm:hidden">New</span>
          </button>
          <img src={avatar} alt="" className="h-11 w-11 rounded-xl object-cover ring-2 ring-card" />
        </div>
      </div>
    </header>
  );
}
