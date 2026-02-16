import { getUserProfile, UserProfile, verifyGardenKey } from "@/services/gardenService";
import { useEffect, useState } from "react";
import { useGardenCore } from "./useGardenCore";

/**
 * Hook for managing the visitor/collaborator view of a shared garden.
 * Handles profile fetching, key verification, and collaborative upload/delete permissions.
 * @param userId - ID of the garden owner.
 * @param editKey - Optional collaborative key from URL params.
 * @returns An object containing shared garden state and management functions.
 */
export function useSharedGarden(userId: string, editKey?: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCollaborator, setIsCollaborator] = useState(false);

  const { photos, uploading, deletingId, fileInputRef, handleUpload, handleDelete, refreshPhotos } =
    useGardenCore(userId);

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
  }, [userId, editKey, refreshPhotos]);

  /**
   * Handles collaborative photo uploads if the user is a verified collaborator.
   * @param e - React change event from a file input.
   */
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
    phrase: lovePhrases.length > 0 ? lovePhrases[index % lovePhrases.length] : "",
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
    lovePhrases,
  };
}
