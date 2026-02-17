import { useAuth } from "@/context/AuthContext";
import {
  addCollaborator,
  Garden,
  GardenTheme,
  getGarden,
  removeCollaborator,
  updateGarden,
  updateGardenName,
  updateLovePhrases,
  updateSpecialDate,
} from "@/services/gardenService";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { useGardenCore } from "./useGardenCore";

/**
 * Hook for managing a specific garden's view and settings.
 * Works for both owners and authorized collaborators.
 * @param gardenId - ID of the garden to load.
 * @returns An object containing garden state and management functions.
 */
export function useGarden(gardenId: string) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const {
    photos,
    uploading,
    loadingPhotos,
    deletingId,
    fileInputRef,
    handleUpload,
    handleDelete,
    refreshPhotos,
  } = useGardenCore(gardenId);

  const [garden, setGarden] = useState<Garden | null>(null);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [gardenName, setGardenName] = useState("Carregando...");
  const [isOwner, setIsOwner] = useState(false);
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [specialDate, setSpecialDate] = useState<Date | null>(null);
  const [specialDateTitle, setSpecialDateTitle] = useState("Data Especial");
  const [showDateModal, setShowDateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [lovePhrases, setLovePhrases] = useState<string[]>([]);
  const phrasesInputRef = useRef<HTMLInputElement>(null);
  const [showPhrasesModal, setShowPhrasesModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchData() {
      if (gardenId && user) {
        try {
          await refreshPhotos();
          const gardenData = await getGarden(gardenId);
          if (gardenData) {
            setGarden(gardenData);
            setGardenName(gardenData.name);
            setSpecialDate(
              gardenData.specialDate
                ? typeof gardenData.specialDate === "object" && "seconds" in gardenData.specialDate
                  ? new Date(gardenData.specialDate.seconds * 1000)
                  : new Date(gardenData.specialDate)
                : null,
            );
            setSpecialDateTitle(gardenData.specialDateTitle || "Data Especial");
            setLovePhrases(gardenData.lovePhrases || []);

            setIsOwner(gardenData.ownerId === user.uid);
            setIsCollaborator(gardenData.collaboratorIds.includes(user.uid) || gardenData.ownerId === user.uid);
          } else {
            router.push("/dashboard");
          }
        } catch (error) {
          console.error("Error fetching garden data:", error);
        }
      }
    }
    fetchData();
  }, [user, gardenId]);

  /**
   * Handles file selection and triggers the upload process using the current user's name.
   * @param e - React change event from a file input.
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user && gardenId) {
      handleUpload(e, user.uid, user.displayName || "Cozinheiro Especial");
    }
  };

  const photosWithPhrases = photos.map((photo, index) => ({
    ...photo,
    phrase: lovePhrases.length > 0 ? lovePhrases[index % lovePhrases.length] : "",
  }));

  /**
   * Copies the public view-only link to the clipboard.
   */
  const copyViewLink = () => {
    if (user) {
      navigator.clipboard.writeText(`${window.location.origin}/garden/${user.uid}`);
      setShowShareModal(false);
      Swal.fire("Sucesso", "Link de visualização copiado!", "success");
    }
  };

  /**
   * Copies the collaborative edit link to the clipboard.
   */
  const copyEditLink = () => {
    if (user && editKey) {
      navigator.clipboard.writeText(`${window.location.origin}/garden/${user.uid}?key=${editKey}`);
      setShowShareModal(false);
      Swal.fire("Sucesso", "Link de colaboração copiado!", "success");
    }
  };

  /**
   * Saves the updated garden name to the user's profile.
   */
  const saveName = async () => {
    if (gardenId && tempName.trim()) {
      const newName = tempName.trim();
      setGardenName(newName);
      setIsEditingName(false);
      try {
        await updateGardenName(gardenId, newName);
      } catch {
        console.error("Failed to save name");
      }
    } else {
      setIsEditingName(false);
    }
  };

  /**
   * Saves a special countdown date and title.
   * @param date - The target date.
   * @param title - The title of the special date.
   */
  const handleSaveSpecialDate = async (date: Date | null, title: string) => {
    if (gardenId) {
      try {
        await updateSpecialDate(gardenId, date, title);
        setSpecialDate(date);
        setSpecialDateTitle(title);
        setShowDateModal(false);
        Swal.fire("Sucesso", "Data especial salva!", "success");
      } catch {
        Swal.fire("Erro", "Falha ao salvar data.", "error");
      }
    }
  };

  /**
   * Imports a JSON file containing love phrases.
   * @param e - React change event from a file input.
   */
  const handlePhrasesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && gardenId) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const phrases = JSON.parse(event.target?.result as string);
          if (Array.isArray(phrases)) {
            const valid = phrases.filter((p) => typeof p === "string");
            await updateLovePhrases(gardenId, valid);
            setLovePhrases(valid);
            Swal.fire("Sucesso", "Frases atualizadas! ❤️", "success");
          }
        } catch {
          Swal.fire("Erro", "JSON inválido.", "error");
        } finally {
          if (phrasesInputRef.current) phrasesInputRef.current.value = "";
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  /**
   * Persists updated love phrases to the user's profile.
   * @param newPhrases - Array of strings.
   */
  const handleSavePhrases = async (newPhrases: string[]) => {
    if (gardenId) {
      await updateLovePhrases(gardenId, newPhrases);
      setLovePhrases(newPhrases);
    }
  };

  const handleUpdateTheme = async (theme: GardenTheme) => {
    if (gardenId) {
      await updateGarden(gardenId, { theme });
      setGarden((prev) => (prev ? { ...prev, theme } : null));
    }
  };

  return {
    user,
    loading,
    garden,
    photos: photosWithPhrases,
    uploading,
    loadingPhotos,
    deletingId,
    fileInputRef,
    gardenName,
    isEditingName,
    isOwner,
    isCollaborator,
    tempName,
    setTempName,
    handleFileSelect,
    handleDelete,
    startEditing: () => {
      setTempName(gardenName);
      setIsEditingName(true);
    },
    saveName,
    handleKeyDown: (_: React.KeyboardEvent) => {
      if (_.key === "Enter") saveName();
      if (_.key === "Escape") setIsEditingName(false);
    },
    showShareModal,
    setShowShareModal,
    specialDate,
    specialDateTitle,
    showDateModal,
    setShowDateModal,
    handleSaveSpecialDate,
    lovePhrases,
    phrasesInputRef,
    handlePhrasesUpload,
    showPhrasesModal,
    setShowPhrasesModal,
    handleSavePhrases,
    updateTheme: handleUpdateTheme,
    inviteCollaborator: (collabId: string) => addCollaborator(gardenId, collabId),
    removeCollaborator: (collabId: string) => removeCollaborator(gardenId, collabId),
  };
}
