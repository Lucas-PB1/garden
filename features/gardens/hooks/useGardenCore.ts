import { MAX_STORAGE_IMAGE_BYTES, MAX_UPLOAD_SOURCE_BYTES } from "@/features/gardens/constants";
import {
  deletePhoto,
  GardenPhoto,
  getGardenPhotos,
  uploadPhoto,
} from "@/features/gardens/services/gardenService";
import { compressImageToWebP } from "@/features/gardens/utils/imageUtils";
import { useCallback, useRef, useState } from "react";
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
  const refreshPhotos = useCallback(async () => {
    if (!gardenId) return;
    try {
      const photosData = await getGardenPhotos(gardenId);
      setPhotos(photosData);
    } catch (error) {
      console.error("Error refreshing photos:", error);
    } finally {
      setLoadingPhotos(false);
    }
  }, [gardenId]);

  /**
   * Handles the selection and upload process of a photo.
   * Compresses the image and prompts for a memory date.
   * @param e - React change event from a file input.
   * @param userId - ID of the uploader.
   * @param uploaderName - Name of the person uploading.
   */
  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, userId: string, uploaderName: string) => {
      if (e.target.files && e.target.files[0] && userId) {
        try {
          const originalFile = e.target.files[0];
          if (!originalFile.type.startsWith("image/")) {
            Swal.fire("Erro", "Por favor, envie um arquivo de imagem válido.", "error");
            return;
          }
          if (originalFile.size > MAX_UPLOAD_SOURCE_BYTES) {
            Swal.fire("Erro", "Envie uma imagem de até 15 MB.", "error");
            return;
          }

          const { value: dateVal } = await Swal.fire({
            title: "Data da memória",
            input: "date",
            inputValue: new Date().toISOString().split("T")[0],
            showCancelButton: true,
            confirmButtonText: "Salvar memória",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#be123c",
          });

          if (!dateVal) return;

          setUploading(true);

          const webpFile = await compressImageToWebP(originalFile);
          if (webpFile.size > MAX_STORAGE_IMAGE_BYTES) {
            Swal.fire("Erro", "A imagem otimizada ainda ficou grande demais.", "error");
            return;
          }

          const formattedDate = new Date(dateVal + "T12:00:00").toLocaleDateString();
          await uploadPhoto({
            file: webpFile,
            gardenId,
            uploaderId: userId,
            caption: formattedDate,
            uploaderName,
          });
          await refreshPhotos();
        } catch (error) {
          console.error("Upload failed", error);
          Swal.fire("Erro", "Falha ao enviar foto.", "error");
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      }
    },
    [gardenId, refreshPhotos],
  );

  /**
   * Prompts for confirmation and deletes a photo.
   * @param photo - The photo object to delete.
   */
  const handleDelete = async (photo: GardenPhoto) => {
    const result = await Swal.fire({
      title: "Excluir memória?",
      text: "Essa foto será removida da coleção.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#cbd5e1",
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setDeletingId(photo.id);
      try {
        await deletePhoto(photo.id, photo.path);
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
        Swal.fire("Removida", "A memória foi excluída.", "success");
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
