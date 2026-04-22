import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children, action }: { children: ReactNode; action?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMenu={() => setOpen(true)} action={action} />
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
