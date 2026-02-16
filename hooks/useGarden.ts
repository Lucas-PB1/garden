import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { updateGardenName, getUserProfile, getGardenKey, updateSpecialDate, updateLovePhrases } from "@/services/gardenService";
import { useGardenCore } from "./useGardenCore";
import Swal from "sweetalert2";

export function useGarden() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Core Logic (Photos, Upload, Delete)
    const {
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
    } = useGardenCore(user?.uid || "");

    // Owner specifics
    const [editKey, setEditKey] = useState<string | null>(null);
    const [gardenName, setGardenName] = useState("Meu Jardim");
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");
    const [specialDate, setSpecialDate] = useState<Date | null>(null);
    const [specialDateTitle, setSpecialDateTitle] = useState("Data Especial");
    const [showDateModal, setShowDateModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    // Love Phrases State
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
                            setSpecialDate(typeof profile.specialDate === 'object' && 'seconds' in profile.specialDate
                                ? new Date(profile.specialDate.seconds * 1000)
                                : new Date(profile.specialDate));
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
    }, [user]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (user) handleUpload(e, user.displayName || "Alguém especial");
    };

    const photosWithPhrases = photos.map((photo, index) => ({
        ...photo,
        phrase: lovePhrases.length > 0 ? lovePhrases[index % lovePhrases.length] : ""
    }));

    const copyViewLink = () => {
        if (user) {
            navigator.clipboard.writeText(`${window.location.origin}/garden/${user.uid}`);
            setShowShareModal(false);
            Swal.fire("Sucesso", "Link de visualização copiado!", "success");
        }
    };

    const copyEditLink = () => {
        if (user && editKey) {
            navigator.clipboard.writeText(`${window.location.origin}/garden/${user.uid}?key=${editKey}`);
            setShowShareModal(false);
            Swal.fire("Sucesso", "Link de colaboração copiado!", "success");
        }
    };

    const saveName = async () => {
        if (user && tempName.trim()) {
            const newName = tempName.trim();
            setGardenName(newName);
            setIsEditingName(false);
            try { await updateGardenName(user.uid, newName); }
            catch (e) { console.error("Failed to save name", e); }
        } else {
            setIsEditingName(false);
        }
    };

    const handleSaveSpecialDate = async (date: Date | null, title: string) => {
        if (user) {
            try {
                await updateSpecialDate(user.uid, date, title);
                setSpecialDate(date);
                setSpecialDateTitle(title);
                setShowDateModal(false);
                Swal.fire("Sucesso", "Data especial salva!", "success");
            } catch (e) {
                Swal.fire("Erro", "Falha ao salvar data.", "error");
            }
        }
    };

    const handlePhrasesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0] && user) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const phrases = JSON.parse(event.target?.result as string);
                    if (Array.isArray(phrases)) {
                        const valid = phrases.filter(p => typeof p === 'string');
                        await updateLovePhrases(user.uid, valid);
                        setLovePhrases(valid);
                        Swal.fire("Sucesso", "Frases atualizadas! ❤️", "success");
                    }
                } catch (e) { Swal.fire("Erro", "JSON inválido.", "error"); }
                finally { if (phrasesInputRef.current) phrasesInputRef.current.value = ""; }
            };
            reader.readAsText(e.target.files[0]);
        }
    };

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
        startEditing: () => { setTempName(gardenName); setIsEditingName(true); },
        saveName,
        handleKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setIsEditingName(false); },
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
        handleSavePhrases
    };
}
