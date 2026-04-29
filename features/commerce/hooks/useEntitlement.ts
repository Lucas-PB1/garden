import { db } from "@/lib/firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import type { UserEntitlement } from "../types";

export function useEntitlement(userId: string | undefined) {
  const [state, setState] = useState<{
    userId: string | undefined;
    entitlement: UserEntitlement | null;
  }>({ userId: undefined, entitlement: null });

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = onSnapshot(
      doc(db, "entitlements", userId),
      (snapshot) => {
        setState({
          userId,
          entitlement: snapshot.exists() ? (snapshot.data() as UserEntitlement) : null,
        });
      },
      (error) => {
        console.error("Entitlement fetch failed", error);
        setState({ userId, entitlement: null });
      },
    );

    return () => unsubscribe();
  }, [userId]);

  const loading = Boolean(userId && state.userId !== userId);
  const entitlement = loading || !userId ? null : state.entitlement;

  return {
    entitlement,
    loading,
    hasAccess: Boolean(entitlement?.active),
  };
}
