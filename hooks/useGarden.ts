import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getGardenPhotos, uploadPhoto, deletePhoto, updateGardenName, getUserProfile, getGardenKey, updateSpecialDate, updateLovePhrases, GardenPhoto } from "@/services/gardenService";
import { compressImageToWebP } from "@/utils/imageUtils";
import Swal from "sweetalert2";

export function useGarden() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<GardenPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shareText, setShareText] = useState("Compartilhar Jardim");
  const [showShareModal, setShowShareModal] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  
  // Custom Name State
  const [gardenName, setGardenName] = useState("Meu Jardim");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // Special Date State
  const [specialDate, setSpecialDate] = useState<Date | null>(null);
  const [specialDateTitle, setSpecialDateTitle] = useState("Data Especial");
  const [showDateModal, setShowDateModal] = useState(false);

  // Love Phrases State
  const [lovePhrases, setLovePhrases] = useState<string[]>([]);
  const phrasesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchData() {
        if (user) {
            try {
                // Fetch Photos
                const photosData = await getGardenPhotos(user.uid);
                setPhotos(photosData);

                // Fetch Profile (Garden Name)
                const profile = await getUserProfile(user.uid);
                if (profile?.gardenName) {
                    setGardenName(profile.gardenName);
                } else if (user.displayName) {
                    setGardenName(`Jardim de ${user.displayName}`);
                }

                if (profile?.specialDate) {
                  // Handle Firestore Timestamp
                  if (typeof profile.specialDate === 'object' && 'seconds' in profile.specialDate) {
                    setSpecialDate(new Date(profile.specialDate.seconds * 1000));
                  } else {
                    setSpecialDate(new Date(profile.specialDate));
                  }
                }
                if (profile?.specialDateTitle) {
                  setSpecialDateTitle(profile.specialDateTitle);
                }
                
                if (profile?.lovePhrases) {
                    setLovePhrases(profile.lovePhrases);
                }

                // Fetch Edit Key
                const key = await getGardenKey(user.uid);
                setEditKey(key);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoadingPhotos(false);
            }
        }
    }
    fetchData();
  }, [user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user) {
        setUploading(true);
        try {
            const originalFile = e.target.files[0];
            if (!originalFile.type.startsWith("image/")) {
                Swal.fire("Erro", "Por favor, envie um arquivo de imagem válido.", "error");
                setUploading(false);
                return;
            }
            const webpFile = await compressImageToWebP(originalFile);
            const caption = new Date().toLocaleDateString(); 
            await uploadPhoto(webpFile, user.uid, caption);
            const updatedPhotos = await getGardenPhotos(user.uid);
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

  const handleDelete = async (photo: GardenPhoto) => {
    const result = await Swal.fire({
        title: "Tem certeza?",
        text: "Tem certeza que deseja podar esta memória?",
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
  }

  const handleShare = () => {
      setShowShareModal(true);
  };

  const copyViewLink = () => {
    if (user) {
        const url = `${window.location.origin}/garden/${user.uid}`;
        navigator.clipboard.writeText(url);
        setShowShareModal(false);
        Swal.fire("Sucesso", "Link de visualização copiado!", "success");
    }
  };

  const copyEditLink = () => {
      if (user && editKey) {
          const url = `${window.location.origin}/garden/${user.uid}?key=${editKey}`;
          navigator.clipboard.writeText(url);
          setShowShareModal(false);
          Swal.fire("Sucesso", "Link de colaboração copiado! Quem tiver este link poderá editar seu jardim.", "success");
      }
  };

  const startEditing = () => {
    setTempName(gardenName);
    setIsEditingName(true);
  };

  const saveName = async () => {
    if (user && tempName.trim()) {
        const newName = tempName.trim();
        setGardenName(newName);
        setIsEditingName(false);
        try {
            await updateGardenName(user.uid, newName);
        } catch (e) {
            console.error("Failed to save name", e);
        }
    } else {
        setIsEditingName(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') saveName();
      if (e.key === 'Escape') setIsEditingName(false);
  }

  const handleSaveSpecialDate = async (date: Date | null, title: string) => {
      if (user) {
          try {
              await updateSpecialDate(user.uid, date, title);
              setSpecialDate(date);
              setSpecialDateTitle(title);
              setShowDateModal(false);
              Swal.fire("Sucesso", "Data especial salva com sucesso!", "success");
          } catch (e) {
              console.error("Failed to save special date", e);
              Swal.fire("Erro", "Falha ao salvar data especial.", "error");
          }
      }
  };

  const handlePhrasesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && user) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = async (event) => {
              try {
                  const content = event.target?.result as string;
                  const phrases = JSON.parse(content);
                  if (Array.isArray(phrases)) {
                      await updateLovePhrases(user.uid, phrases);
                      setLovePhrases(phrases);
                      Swal.fire("Sucesso", "Frases de amor atualizadas! ❤️", "success");
                  } else {
                      Swal.fire("Erro", "O arquivo deve conter uma lista de frases.", "error");
                  }
              } catch (error) {
                  console.error("Invalid JSON", error);
                  Swal.fire("Erro", "Arquivo inválido.", "error");
              } finally {
                if (phrasesInputRef.current) phrasesInputRef.current.value = "";
              }
          };
          reader.readAsText(file);
      }
  };

  return {
      user,
      loading,
      photos,
      uploading,
      loadingPhotos,
      deletingId,
      fileInputRef,
      shareText,
      gardenName,
      isEditingName,
      tempName,
      setTempName,
      handleFileSelect,
      handleDelete,
      handleShare,
      startEditing,
      saveName,
      handleKeyDown,
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
      handlePhrasesUpload
  };
}
