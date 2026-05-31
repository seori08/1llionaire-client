"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserRoleBadge } from "@/components/common/StatusBadge";
import { LogOut, Mic } from "lucide-react";
import { authApi } from "@/lib/api";

export function Header() {
  const { user, clearAuth } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearAuth();
    queryClient.clear();
    router.push("/");
  };

  const dashboardHref =
    user?.user_type === "admin" ? "/admin"
    : user?.user_type === "customer" ? "/customer/requests"
    : user?.user_type === "freelancer" ? "/freelancer/profile"
    : "/";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <span className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
            <Mic className="h-4 w-4 text-gold" />
          </span>
          <span>프리마이크</span>
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link href={dashboardHref}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserRoleBadge role={user.user_type} />
                  <span className="hidden sm:inline text-sm">{user.name}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="로그아웃">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">로그인</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-navy text-white hover:bg-navy-light">회원가입</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
