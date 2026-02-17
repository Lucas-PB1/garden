"use client";

import GardenLayout from "@/components/GardenLayout";
import { useAuth } from "@/context/AuthContext";
import { useGardenDashboard } from "@/hooks/useGardenDashboard";
import { createGarden, deleteGarden } from "@/services/gardenService";
import Link from "next/link";
import { useState } from "react";
import Swal from "sweetalert2";
import { FaCopy, FaTrash } from "react-icons/fa";

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const { gardens, loading: gardensLoading, filter, setFilter, refreshDashboard } = useGardenDashboard(user?.uid);
    const [creating, setCreating] = useState(false);

    const handleCreateGarden = async () => {
        if (!user) return;

        const { value: name } = await Swal.fire({
            title: "Nome do seu novo Jardim",
            input: "text",
            inputPlaceholder: "Ex: Nossas Memórias",
            showCancelButton: true,
            confirmButtonColor: "#ec4899",
            confirmButtonText: "Criar",
        });

        if (name) {
            setCreating(true);
            try {
                await createGarden(user.uid, name);
                await refreshDashboard();
                Swal.fire("Sucesso", "Jardim criado com sucesso!", "success");
            } catch (error) {
                Swal.fire("Erro", "Não foi possível criar o jardim.", "error");
            } finally {
                setCreating(false);
            }
        }
    };

    const handleDeleteGarden = async (gardenId: string, gardenName: string) => {
        const result = await Swal.fire({
            title: `Excluir "${gardenName}"?`,
            text: "Você tem certeza? Todas as fotos serão apagadas para sempre. Não há como desfazer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#cbd5e1",
            confirmButtonText: "Sim, excluir",
            cancelButtonText: "Cancelar"
        });

        if (result.isConfirmed) {
            try {
                Swal.showLoading();
                await deleteGarden(gardenId);
                await refreshDashboard();
                Swal.fire("Excluído!", "O jardim foi removido.", "success");
            } catch (error) {
                console.error(error);
                Swal.fire("Erro", "Falha ao excluir o jardim.", "error");
            }
        }
    };

    const copyUserId = () => {
        if (user?.uid) {
            navigator.clipboard.writeText(user.uid);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'ID copiado!',
                showConfirmButton: false,
                timer: 1500
            });
        }
    };

    if (authLoading || (gardensLoading && gardens.length === 0)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
            </div>
        );
    }

    return (
        <GardenLayout>
            <div className="max-w-6xl mx-auto py-8">
                <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-gray-800">Seus Jardins</h1>
                        <p className="text-gray-500 mt-2">Gerencie e cultive suas coleções de memórias</p>

                        {user && (
                            <div className="mt-4 flex items-center gap-2 bg-pink-50 w-fit px-3 py-1.5 rounded-lg border border-pink-100">
                                <span className="text-xs text-pink-400 font-bold uppercase tracking-wider">Seu ID:</span>
                                <code className="text-xs text-gray-600 font-mono">{user.uid}</code>
                                <button
                                    onClick={copyUserId}
                                    className="ml-2 text-pink-400 hover:text-pink-600 transition"
                                    title="Copiar ID"
                                >
                                    <FaCopy />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white rounded-full p-1 border border-pink-100 shadow-sm flex">
                            <button
                                onClick={() => setFilter("all")}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'all' ? 'bg-pink-500 text-white' : 'text-gray-500 hover:text-pink-400'}`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFilter("mine")}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'mine' ? 'bg-pink-500 text-white' : 'text-gray-500 hover:text-pink-400'}`}
                            >
                                Meus
                            </button>
                            <button
                                onClick={() => setFilter("shared")}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition ${filter === 'shared' ? 'bg-pink-500 text-white' : 'text-gray-500 hover:text-pink-400'}`}
                            >
                                Compartilhados
                            </button>
                        </div>

                        <button
                            onClick={handleCreateGarden}
                            disabled={creating}
                            className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg hover:shadow-pink-500/30 transition transform hover:-translate-y-1 active:translate-y-0"
                        >
                            + Novo Jardim
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {gardens.map((garden) => (
                        <Link href={`/garden/${garden.id}`} key={garden.id} className="group">
                            <div className="bg-white rounded-3xl p-8 border border-pink-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(236,72,153,0.1)] transition-all duration-500 transform group-hover:-translate-y-2 h-full flex flex-col items-center text-center relative">
                                {garden.ownerId === user?.uid && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault(); // Prevent Link navigation
                                            handleDeleteGarden(garden.id, garden.name);
                                        }}
                                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition p-2 z-10"
                                        title="Excluir Jardim"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                                <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition duration-500">
                                    {garden.theme.bgType === 'stars' ? '✨' : garden.theme.bgType === 'floral' ? '🌸' : '🌿'}
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2">{garden.name}</h3>
                                <p className="text-sm text-gray-400 mb-6 italic">
                                    {garden.ownerId === user?.uid ? "Dono" : "Colaborador"}
                                </p>
                                <div className="mt-auto w-full pt-4 border-t border-pink-50 flex justify-center text-pink-400 text-sm font-bold group-hover:text-pink-600">
                                    Entrar no Jardim →
                                </div>
                            </div>
                        </Link>
                    ))}

                    {gardens.length === 0 && !gardensLoading && (
                        <div className="col-span-full py-20 bg-white/30 backdrop-blur-sm rounded-3xl border-2 border-dashed border-pink-200 flex flex-col items-center justify-center text-pink-300">
                            <span className="text-6xl mb-4">🌱</span>
                            <p className="text-xl font-bold">Nenhum jardim encontrado</p>
                            <p className="text-sm">Clique em "+ Novo Jardim" para começar sua primeira coleção</p>
                        </div>
                    )}
                </div>
            </div>
        </GardenLayout>
    );
}
