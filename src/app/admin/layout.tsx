"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarPlus,
  List,
  Ban,
  Lock,
  Repeat,
  Eye,
  EyeOff,
} from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("admin_auth");
    if (saved === "true") setAuthenticated(true);
    setChecking(false);
  }, []);

  const handleLogin = async () => {
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      localStorage.setItem("admin_auth", "true");
      setAuthenticated(true);
    } else {
      setError("Invalid password");
    }
  };

  if (checking) return null;

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm space-y-6 rounded-2xl border bg-white p-8 shadow-sm">
          <div className="text-center space-y-2">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100">
              <Lock className="size-5 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold">Admin Login</h1>
            <p className="text-sm text-muted-foreground">
              Enter password to access the dashboard
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-black transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              className="w-full bg-black text-white hover:bg-black/90"
              onClick={handleLogin}
              disabled={!password}
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
                onClick={() => {
                  localStorage.removeItem("admin_auth");
                  setAuthenticated(false);
                  setPassword("");
                }}
                className="text-sm text-red-500 hover:text-red-700"
              >
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
