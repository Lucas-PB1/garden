"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Legacy garden page.
 * Redirects authenticated users to their dashboard to manage multiple gardens.
 */
export default function GardenPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
    </div>
  );
}
