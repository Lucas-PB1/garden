import { useState, useEffect } from "react";
import { getUserProfile, verifyGardenKey, UserProfile } from "@/services/gardenService";
import { useGardenCore } from "./useGardenCore";

export function useSharedGarden(userId: string, editKey?: string | null) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCollaborator, setIsCollaborator] = useState(false);

    // Core Logic (Photos, Upload, Delete)
    const {
        photos,
        uploading,
        deletingId,
        fileInputRef,
        handleUpload,
        handleDelete,
        refreshPhotos
    } = useGardenCore(userId);

    // Initial Fetch & Key Verification
    useEffect(() => {
        async function fetchData() {
            if (userId) {
                try {
                    await refreshPhotos();
                    const profileData = await getUserProfile(userId);
                    setProfile(profileData);

                    if (editKey) {
                        const valid = await verifyGardenKey(userId, editKey);
                        setIsCollaborator(valid);
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchData();
    }, [userId, editKey]);

    const handleCollaborativeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isCollaborator) {
            const { getAuth } = await import("firebase/auth");
            const uploaderName = getAuth().currentUser?.displayName || "Convidado";
            await handleUpload(e, uploaderName, editKey || undefined);
        }
    };

    const gardenName = profile?.gardenName || "Coleção do Jardim";
    const specialDate = profile?.specialDate;
    const specialDateTitle = profile?.specialDateTitle;
    const lovePhrases = profile?.lovePhrases || [];

    const photosWithPhrases = photos.map((photo, index) => ({
        ...photo,
        phrase: lovePhrases.length > 0 ? lovePhrases[index % lovePhrases.length] : ""
    }));

    return {
        photos: photosWithPhrases,
        loading,
        gardenName,
        isCollaborator,
        uploading,
        deletingId,
        fileInputRef,
        handleCollaborativeUpload,
        handleCollaborativeDelete: handleDelete,
        specialDate,
        specialDateTitle,
        lovePhrases
    };
}
