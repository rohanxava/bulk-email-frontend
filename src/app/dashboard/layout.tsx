"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AreaChart,
  FolderKanban,
  Home,
  LayoutTemplate,
  LogOut,
  Mail,
  Settings,
  Users,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo"; // your logo component
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/projects", icon: FolderKanban, label: "Projects" },
  { href: "/dashboard/campaigns", icon: Mail, label: "Campaigns" },
  { href: "/dashboard/templates", icon: LayoutTemplate, label: "Templates" },
  { href: "/dashboard/reports", icon: AreaChart, label: "Reports" },
  { href: "/dashboard/users", icon: Users, label: "Users" },
];

const settingsItem = {
  href: "/dashboard/settings",
  icon: Settings,
  label: "Settings",
};

function UserMenu() {
  const { user, loading } = useUser();

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 bg-gray-200">
            <AvatarImage
              src="https://propertypanda.ae/public/assets/admin/img/users/user-0.png"
              alt={user?.name || "@user"}
            />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {loading ? "Loading..." : user?.name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {loading ? "" : user?.email || "user@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavItem({
  item,
}: {
  item: { href: string; icon: React.ElementType; label: string };
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive = pathname === item.href;
  const { isMobile } = useSidebar();

  if (isMobile) {
    return (
      <Link href={item.href} className="w-full">
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className="w-full justify-start gap-2"
        >
          <Icon className="h-4 w-4" />
          {item.label}
        </Button>
      </Link>
    );
  }

  return (
    <SidebarMenuItem>
      <Link href={item.href}>
        <SidebarMenuButton
          isActive={isActive}
          tooltip={item.label}
          className="w-full justify-start gap-2"
        >
          <Icon className="size-4" />
          <span>{item.label}</span>
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser(); // 👈 get current user

  const filteredNavItems = React.useMemo(() => {
    if (!user || loading) return [];
    // Only include "Users" if super_admin
    return navItems.filter(item =>
      item.href === "/dashboard/users" ? user.role === "super_admin" : true
    );
  }, [user, loading]);

  const showSettings = user?.role === "super_admin"; // 👈 condition for settings

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex items-center px-4 py-2 gap-2">
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {filteredNavItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            {showSettings && <NavItem item={settingsItem} />}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="ml-auto">
            <UserMenu />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

