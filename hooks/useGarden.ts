import { useAuth } from "@/context/AuthContext";
import {
  getGardenKey,
  getUserProfile,
  updateGardenName,
  updateLovePhrases,
  updateSpecialDate,
} from "@/services/gardenService";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { useGardenCore } from "./useGardenCore";

/**
 * Hook for managing the garden owner's view and settings.
 * Includes authentication check, profile fetching, and collaborative key management.
 * @returns An object containing garden state and management functions.
 */
export function useGarden() {
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
  } = useGardenCore(user?.uid || "");

  const [editKey, setEditKey] = useState<string | null>(null);
  const [gardenName, setGardenName] = useState("Meu Jardim");
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
      if (user) {
        try {
          await refreshPhotos();
          const profile = await getUserProfile(user.uid);
          if (profile) {
            if (profile.gardenName) setGardenName(profile.gardenName);
            else if (user.displayName) setGardenName(`Jardim de ${user.displayName}`);

            if (profile.specialDate) {
              setSpecialDate(
                typeof profile.specialDate === "object" && "seconds" in profile.specialDate
                  ? new Date(profile.specialDate.seconds * 1000)
                  : new Date(profile.specialDate),
              );
            }
            if (profile.specialDateTitle) setSpecialDateTitle(profile.specialDateTitle);
            if (profile.lovePhrases) setLovePhrases(profile.lovePhrases);
          }
          const key = await getGardenKey(user.uid);
          setEditKey(key);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    }
    fetchData();
  }, [user, refreshPhotos]);

  /**
   * Handles file selection and triggers the upload process using the current user's name.
   * @param e - React change event from a file input.
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user) handleUpload(e, user.displayName || "Alguém especial");
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
    if (user && tempName.trim()) {
      const newName = tempName.trim();
      setGardenName(newName);
      setIsEditingName(false);
      try {
        await updateGardenName(user.uid, newName);
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
    if (user) {
      try {
        await updateSpecialDate(user.uid, date, title);
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
    if (e.target.files?.[0] && user) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const phrases = JSON.parse(event.target?.result as string);
          if (Array.isArray(phrases)) {
            const valid = phrases.filter((p) => typeof p === "string");
            await updateLovePhrases(user.uid, valid);
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
    if (user) {
      await updateLovePhrases(user.uid, newPhrases);
      setLovePhrases(newPhrases);
    }
  };

  return {
    user,
    loading,
    photos: photosWithPhrases,
    uploading,
    loadingPhotos,
    deletingId,
    fileInputRef,
    gardenName,
    isEditingName,
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
    copyViewLink,
    copyEditLink,
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
  };
}
