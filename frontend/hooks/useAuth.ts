"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@/lib/navigation";

export function useAuth() {
  const router = useRouter();

  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        return null;
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return {
    user,
    isLoading,
    signOut,
    isAdmin: user?.role === "admin",
    isViewer: user?.role === "viewer",
  };
}
