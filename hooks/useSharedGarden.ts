import { useState, useEffect, useRef } from "react";
import { getGardenPhotos, getUserProfile, verifyGardenKey, uploadPhoto, deletePhoto, updateGardenName, GardenPhoto, UserProfile } from "@/services/gardenService";
import { compressImageToWebP } from "@/utils/imageUtils";
import Swal from "sweetalert2";

export function useSharedGarden(userId: string, editKey?: string | null) {
  const [photos, setPhotos] = useState<GardenPhoto[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Fetch & Key Verification
  useEffect(() => {
    async function fetchData() {
        if (userId) {
            try {
                const photosData = await getGardenPhotos(userId);
                setPhotos(photosData);
                
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

  // Actions for Collaborators
  const handleCollaborativeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && isCollaborator) {
        setUploading(true);
        try {
            const originalFile = e.target.files[0];
            if (!originalFile.type.startsWith("image/")) {
                Swal.fire("Erro", "Por favor, envie um arquivo de imagem válido.", "error");
                return;
            }
            const webpFile = await compressImageToWebP(originalFile);
            const caption = new Date().toLocaleDateString() + " (Colaborador)"; 
            await uploadPhoto(webpFile, userId, caption, editKey || undefined);
            
            // Refresh
            const updatedPhotos = await getGardenPhotos(userId);
            setPhotos(updatedPhotos);
        } catch (error) {
            console.error("Upload failed", error);
            Swal.fire("Erro", "Falha ao enviar foto.", "error");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ""; 
        }
    }
  };

  const handleCollaborativeDelete = async (photo: GardenPhoto) => {
    if (!isCollaborator) return;
    const result = await Swal.fire({
        title: "Tem certeza?",
        text: "Como colaborador, tem certeza que deseja podar esta memória?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sim, podar!",
        cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
        setDeletingId(photo.id);
        try {
            await deletePhoto(photo.id, photo.path);
            setPhotos(photos.filter(p => p.id !== photo.id));
            Swal.fire("Podada!", "Sua memória foi removida.", "success");
        } catch (error) {
            console.error("Failed to delete", error);
            Swal.fire("Erro", "Não foi possível excluir a foto.", "error");
        } finally {
            setDeletingId(null);
        }
    }
  };

  const gardenName = profile?.gardenName || "Coleção do Jardim";
  const specialDate = profile?.specialDate;
  const specialDateTitle = profile?.specialDateTitle;
  const lovePhrases = profile?.lovePhrases || [];

  return {
      photos,
      loading,
      gardenName,
      isCollaborator,
      uploading,
      deletingId,
      fileInputRef,
      handleCollaborativeUpload,
      handleCollaborativeDelete,
      specialDate,
      specialDateTitle,
      lovePhrases
  };
}
