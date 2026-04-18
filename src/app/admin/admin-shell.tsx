"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarPlus,
  List,
  Ban,
  Loader2,
} from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Create Booking", href: "/admin", icon: CalendarPlus },
  { title: "All Bookings", href: "/admin/bookings", icon: List },
  // { title: "Recurring Bookings", href: "/admin/recurring", icon: Repeat },
  { title: "Mark Unavailable", href: "/admin/unavailable", icon: Ban },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore; we still navigate away so the server will clear or reject next request
    }
    router.push("/login");
    router.refresh();
  };

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="p-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-base font-bold tracking-tight"
            >
              <Image
                src="/image/logo.png"
                alt="Krishna Twin Turf"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
              <div>
                Krishna <span className="text-blue-600">Twin Turf</span>
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  Admin
                </span>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <NavMenu pathname={pathname} />
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-3">
              <a
                href="/"
                className="text-sm text-muted-foreground hover:text-black"
              >
                View Website
              </a>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 disabled:opacity-60"
              >
                {loggingOut && <Loader2 className="size-3.5 animate-spin" />}
                Logout
              </button>
            </div>
          </header>
          <div className="p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

function NavMenu({ pathname }: { pathname: string }) {
  const { setOpenMobile, isMobile } = useSidebar();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            render={
              <Link
                href={item.href}
                onClick={() => {
                  if (isMobile) setOpenMobile(false);
                }}
              />
            }
            isActive={pathname === item.href}
          >
            <item.icon />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
