"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { User, LogOut, Settings } from "lucide-react";
import { useStore } from "@/lib/store";

export function TopBar() {
  const router = useRouter();
  const { currentAdmin, logoutAdmin } = useStore();

  const handleLogout = () => {
    logoutAdmin();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <div className="md:hidden flex items-center gap-2">
          <span className="font-semibold text-lg">Dispatchly</span>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarImage src={currentAdmin?.avatar_url || ""} alt="User avatar" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {currentAdmin ? getInitials(currentAdmin.name) : "?"}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-medium">{currentAdmin?.name || "Guest"}</span>
              <span className="text-xs text-muted-foreground">{currentAdmin?.email || ""}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
