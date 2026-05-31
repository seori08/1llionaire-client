"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserType } from "@/types";
import { LoadingState } from "@/components/common/States";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserType[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.user_type)) {
      router.replace("/403");
    }
  }, [user, isLoading, allowedRoles, router]);

  if (isLoading) return <LoadingState />;
  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.user_type)) return null;

  return <>{children}</>;
}
