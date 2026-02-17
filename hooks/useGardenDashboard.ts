import { Garden, getUserGardens } from "@/services/gardenService";
import { useEffect, useState } from "react";

/**
 * Hook for managing the multi-garden dashboard.
 * Fetches and filters gardens where the user is an owner or a collaborator.
 * @param userId - The ID of the current user.
 * @returns Dashboard state including gardens and filter controls.
 */
export function useGardenDashboard(userId: string | undefined) {
    const [gardens, setGardens] = useState<Garden[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "mine" | "shared">("all");

    const refreshDashboard = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await getUserGardens(userId);
            setGardens(data);
        } catch (error) {
            console.error("Dashboard fetch failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshDashboard();
    }, [userId]);

    const filteredGardens = gardens.filter((garden) => {
        if (filter === "mine") return garden.ownerId === userId;
        if (filter === "shared") return garden.ownerId !== userId;
        return true;
    });

    return {
        gardens: filteredGardens,
        loading,
        filter,
        setFilter,
        refreshDashboard,
    };
}
