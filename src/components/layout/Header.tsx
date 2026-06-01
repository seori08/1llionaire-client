"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Moon, Sun } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UserRoleBadge } from "@/components/common/StatusBadge";
import { authApi } from "@/lib/api";

type Theme = "light" | "dark";

export function Header() {
  const { user, clearAuth } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme") as Theme | null;
    const systemTheme: Theme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    const initialTheme = savedTheme || systemTheme;

    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    setTheme(initialTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";

    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }

    clearAuth();
    queryClient.clear();
    router.push("/");
  };

  const dashboardHref =
    user?.user_type === "admin"
      ? "/admin"
      : user?.user_type === "customer"
        ? "/customer/requests"
        : user?.user_type === "freelancer"
          ? "/freelancer/profile"
          : "/";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-clear/90 backdrop-blur supports-[backdrop-filter]:bg-clear/75">
      <div className="container mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 text-text">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface ring-1 ring-line">
            <img
              src="/favicon.ico"
              alt="프리마이크"
              className="h-6 w-6 object-contain"
            />
          </span>

          <span className="text-[24px] font-extrabold tracking-[-0.03em]">
            프리마이크
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="테마 변경"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {user ? (
            <>
              <Link href={dashboardHref}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserRoleBadge role={user.user_type} />
                  <span className="hidden text-[17px] sm:inline">
                    {user.name}
                  </span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="로그아웃"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </Link>

              <Link href="/signup">
                <Button variant="primaryCta" size="sm">
                  회원가입
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}