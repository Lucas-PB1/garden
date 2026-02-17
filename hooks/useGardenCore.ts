import { deletePhoto, GardenPhoto, getGardenPhotos, uploadPhoto } from "@/services/gardenService";
import { compressImageToWebP } from "@/utils/imageUtils";
import { useRef, useState } from "react";
import Swal from "sweetalert2";

/**
 * Core hook for managing garden photos, including fetching, uploading, and deleting.
 * @param gardenId - The ID of the specific garden.
 * @returns An object containing photo state and management functions.
 */
export function useGardenCore(gardenId: string) {
  const [photos, setPhotos] = useState<GardenPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Refreshes the local photo list from the service.
   */
  const refreshPhotos = async () => {
    if (!gardenId) return;
    try {
      const photosData = await getGardenPhotos(gardenId);
      setPhotos(photosData);
    } catch (error) {
      console.error("Error refreshing photos:", error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  /**
   * Handles the selection and upload process of a photo.
   * Compresses the image and prompts for a memory date.
   * @param e - React change event from a file input.
   * @param userId - ID of the uploader.
   * @param uploaderName - Name of the person uploading.
   */
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    userId: string,
    uploaderName: string,
  ) => {
    if (e.target.files && e.target.files[0] && userId) {
      setUploading(true);
      try {
        const originalFile = e.target.files[0];
        if (!originalFile.type.startsWith("image/")) {
          Swal.fire("Erro", "Por favor, envie um arquivo de imagem válido.", "error");
          return;
        }
        const webpFile = await compressImageToWebP(originalFile);

        const { value: dateVal } = await Swal.fire({
          title: "Quando foi essa memória?",
          input: "date",
          inputValue: new Date().toISOString().split("T")[0],
          showCancelButton: true,
          confirmButtonText: "Plantar",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#ec4899",
        });

        if (!dateVal) return;

        const formattedDate = new Date(dateVal + "T12:00:00").toLocaleDateString();
        await uploadPhoto(webpFile, gardenId, userId, formattedDate, uploaderName);
        await refreshPhotos();
      } catch (error) {
        console.error("Upload failed", error);
        Swal.fire("Erro", "Falha ao enviar foto.", "error");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  /**
   * Prompts for confirmation and deletes a photo.
   * @param photo - The photo object to delete.
   */
  const handleDelete = async (photo: GardenPhoto) => {
    const result = await Swal.fire({
      title: "Tem certeza?",
      text: "Tem certeza que deseja podar esta memória?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sim, podar!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setDeletingId(photo.id);
      try {
        await deletePhoto(photo.id, photo.path);
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
        Swal.fire("Podada!", "Sua memória foi removida.", "success");
      } catch (error) {
        console.error("Failed to delete", error);
        Swal.fire("Erro", "Não foi possível excluir a foto.", "error");
      } finally {
        setDeletingId(null);
      }
    }
  };

  return {
    photos,
    setPhotos,
    uploading,
    loadingPhotos,
    setLoadingPhotos,
    deletingId,
    fileInputRef,
    handleUpload,
    handleDelete,
    refreshPhotos,
  };
}
