import { useAuth } from "@/context/AuthContext";
import { MAX_PHRASES_IMPORT_BYTES } from "@/features/gardens/constants";
import {
  addCollaborator,
  Garden,
  GardenTheme,
  getGarden,
  removeCollaborator,
  updateGardenName,
  updateGardenTheme,
  updateLovePhrases,
  updateSpecialDate,
} from "@/features/gardens/services/gardenService";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { useGardenCore } from "./useGardenCore";

const parseGardenDate = (date: Garden["specialDate"]) => {
  if (!date) return null;
  if (typeof date === "object" && "seconds" in date) return new Date(date.seconds * 1000);
  return new Date(date);
};

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
  const [loadingGarden, setLoadingGarden] = useState(true);
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
    if (!loading && !user) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(`/garden/${gardenId}`)}`);
    }
  }, [gardenId, user, loading, router]);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      if (loading) return;
      if (!gardenId || !user) {
        if (active) setLoadingGarden(false);
        return;
      }

      setLoadingGarden(true);
      try {
        const gardenData = await getGarden(gardenId);
        if (!active) return;

        if (!gardenData) {
          router.replace("/dashboard");
          return;
        }

        const owner = gardenData.ownerId === user.uid;
        const collaborator = gardenData.collaboratorIds.includes(user.uid);

        if (!owner && !collaborator) {
          router.replace("/dashboard");
          return;
        }

        await refreshPhotos();
        if (!active) return;

        setGarden(gardenData);
        setGardenName(gardenData.name);
        setSpecialDate(parseGardenDate(gardenData.specialDate));
        setSpecialDateTitle(gardenData.specialDateTitle || "Data Especial");
        setLovePhrases(gardenData.lovePhrases || []);
        setIsOwner(owner);
        setIsCollaborator(owner || collaborator);
      } catch (error) {
        console.error("Error fetching garden data:", error);
        if (active) {
          router.replace("/dashboard");
        }
      } finally {
        if (active) {
          setLoadingGarden(false);
        }
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, [gardenId, loading, refreshPhotos, router, user]);

  /**
   * Handles file selection and triggers the upload process using the current user's name.
   * @param e - React change event from a file input.
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user && gardenId) {
      handleUpload(e, user.uid, user.displayName || "Pessoa especial");
    }
  };

  const photosWithPhrases = photos.map((photo, index) => ({
    ...photo,
    phrase: lovePhrases.length > 0 ? lovePhrases[index % lovePhrases.length] : "",
  }));

  /**
   * Saves the updated garden name to the user's profile.
   */
  const saveName = async () => {
    if (gardenId && tempName.trim()) {
      const newName = tempName.trim();
      setIsEditingName(false);
      try {
        await updateGardenName(gardenId, newName);
        setGardenName(newName);
        setGarden((prev) => (prev ? { ...prev, name: newName } : prev));
      } catch {
        Swal.fire("Erro", "Falha ao salvar nome.", "error");
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
      if (e.target.files[0].size > MAX_PHRASES_IMPORT_BYTES) {
        Swal.fire("Erro", "Envie um JSON de frases de até 256 KB.", "error");
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const phrases = JSON.parse(event.target?.result as string);
          if (Array.isArray(phrases)) {
            const valid = phrases.filter((p) => typeof p === "string");
            await updateLovePhrases(gardenId, valid);
            setLovePhrases(valid);
            Swal.fire("Sucesso", "Frases atualizadas.", "success");
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
      await updateGardenTheme(gardenId, theme);
      setGarden((prev) => (prev ? { ...prev, theme } : null));
    }
  };

  const inviteCollaborator = useCallback(
    async (collaboratorId: string) => {
      await addCollaborator(gardenId, collaboratorId);
      setGarden((prev) =>
        prev
          ? {
              ...prev,
              collaboratorIds: Array.from(
                new Set([...prev.collaboratorIds, collaboratorId.trim()]),
              ),
            }
          : prev,
      );
    },
    [gardenId],
  );

  const removeGardenCollaborator = useCallback(
    async (collaboratorId: string) => {
      await removeCollaborator(gardenId, collaboratorId);
      setGarden((prev) =>
        prev
          ? {
              ...prev,
              collaboratorIds: prev.collaboratorIds.filter((id) => id !== collaboratorId),
            }
          : prev,
      );
    },
    [gardenId],
  );

  return {
    user,
    loading,
    loadingGarden,
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
    handleKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Enter") saveName();
      if (event.key === "Escape") setIsEditingName(false);
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
    inviteCollaborator,
    removeCollaborator: removeGardenCollaborator,
  };
}
