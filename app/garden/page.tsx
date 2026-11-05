"use client";

import LoadingScreen from "@/components/brand/LoadingScreen";
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

  return <LoadingScreen />;
}
