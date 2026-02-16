import { useState, useRef } from "react";
import { getGardenPhotos, uploadPhoto, deletePhoto, GardenPhoto } from "@/services/gardenService";
import { compressImageToWebP } from "@/utils/imageUtils";
import Swal from "sweetalert2";

export function useGardenCore(userId: string) {
    const [photos, setPhotos] = useState<GardenPhoto[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loadingPhotos, setLoadingPhotos] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const refreshPhotos = async () => {
        try {
            const photosData = await getGardenPhotos(userId);
            setPhotos(photosData);
        } catch (error) {
            console.error("Error refreshing photos:", error);
        } finally {
            setLoadingPhotos(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, uploaderName: string, editKey?: string) => {
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
                    title: 'Quando foi essa memória?',
                    input: 'date',
                    inputValue: new Date().toISOString().split('T')[0],
                    showCancelButton: true,
                    confirmButtonText: 'Plantar',
                    cancelButtonText: 'Cancelar',
                    confirmButtonColor: '#ec4899',
                });

                if (!dateVal) return;

                const formattedDate = new Date(dateVal + "T12:00:00").toLocaleDateString();
                await uploadPhoto(webpFile, userId, formattedDate, uploaderName, editKey);
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
                setPhotos(prev => prev.filter(p => p.id !== photo.id));
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
        refreshPhotos
    };
}
