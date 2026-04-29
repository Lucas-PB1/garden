"use client";

import { useAuth } from "@/context/AuthContext";
import UserAccountSection from "@/features/auth/components/UserAccountSection";
import { useGoogleAccountLink } from "@/features/auth/hooks/useGoogleAccountLink";
import { updateUserDisplayName } from "@/features/auth/services/authService";
import { useEntitlement } from "@/features/commerce/hooks/useEntitlement";
import GardenLayout from "@/features/gardens/components/GardenLayout";
import { useGardenDashboard } from "@/features/gardens/hooks/useGardenDashboard";
import { createGarden, deleteGarden } from "@/features/gardens/services/gardenService";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaCreditCard, FaLock, FaPlus, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const filterOptions = [
  { id: "all", label: "Todos" },
  { id: "mine", label: "Meus" },
  { id: "shared", label: "Compartilhados" },
] as const;

const getThemeLabel = (bgType: string) => {
  if (bgType === "stars") return "Noite";
  if (bgType === "minimalist") return "Minimalista";
  if (bgType === "custom") return "Capa personalizada";
  return "Floral";
};

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const {
    gardens,
    loading: gardensLoading,
    filter,
    setFilter,
    refreshDashboard,
  } = useGardenDashboard(user?.uid);
  const { hasAccess, loading: entitlementLoading } = useEntitlement(user?.uid);
  const { isGoogleLinked, linkingGoogle, linkGoogleAccount } = useGoogleAccountLink(user);
  const [creating, setCreating] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const router = useRouter();

  const ownedCount = useMemo(
    () => gardens.filter((garden) => garden.ownerId === user?.uid).length,
    [gardens, user?.uid],
  );
  const sharedCount = gardens.length - ownedCount;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?callbackUrl=/dashboard");
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName || user.email?.split("@")[0] || "Usuário Garden");
  }, [user]);

  const handleCreateGarden = async () => {
    if (!user) return;

    if (!hasAccess) {
      const result = await Swal.fire({
        title: "Acesso necessário",
        text: "Para criar uma coleção própria, finalize a compra única do Love Garden.",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#be123c",
        cancelButtonColor: "#cbd5e1",
        confirmButtonText: "Comprar acesso",
        cancelButtonText: "Agora não",
      });

      if (result.isConfirmed) {
        router.push("/checkout");
      }

      return;
    }

    const { value: name } = await Swal.fire({
      title: "Nome da coleção",
      input: "text",
      inputPlaceholder: "Ex: Dia dos Namorados 2026",
      showCancelButton: true,
      confirmButtonColor: "#be123c",
      confirmButtonText: "Criar coleção",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value.trim()) return "Informe um nome para a coleção.";
        if (value.trim().length > 80) return "Use até 80 caracteres.";
        return null;
      },
    });

    if (typeof name === "string" && name.trim()) {
      setCreating(true);
      try {
        await createGarden(user.uid, name.trim());
        await refreshDashboard();
        Swal.fire("Coleção criada", "Seu novo espaço já está pronto.", "success");
      } catch (error) {
        console.error(error);
        Swal.fire("Erro", "Não foi possível criar a coleção.", "error");
      } finally {
        setCreating(false);
      }
    }
  };

  const handleDeleteGarden = async (gardenId: string, gardenName: string) => {
    const result = await Swal.fire({
      title: `Excluir "${gardenName}"?`,
      text: "As fotos dessa coleção serão apagadas. Essa ação não pode ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#cbd5e1",
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        Swal.showLoading();
        await deleteGarden(gardenId);
        await refreshDashboard();
        Swal.fire("Excluída", "A coleção foi removida.", "success");
      } catch (error) {
        console.error(error);
        Swal.fire("Erro", "Falha ao excluir a coleção.", "error");
      }
    }
  };

  const copyUserId = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "ID copiado",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleEditDisplayName = async () => {
    if (!user) return;

    const { value } = await Swal.fire({
      title: "Editar nome",
      input: "text",
      inputValue: displayName,
      inputPlaceholder: "Nome exibido",
      showCancelButton: true,
      confirmButtonColor: "#be123c",
      confirmButtonText: "Salvar",
      cancelButtonText: "Cancelar",
      inputValidator: (name) => {
        if (!name.trim()) return "Informe um nome.";
        if (name.trim().length > 80) return "Use até 80 caracteres.";
        return null;
      },
    });

    if (typeof value !== "string") return;

    setUpdatingProfile(true);
    try {
      const nextDisplayName = await updateUserDisplayName(user, value);
      setDisplayName(nextDisplayName);
      Swal.fire("Nome atualizado", "Seus dados foram salvos.", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Erro", "Não foi possível atualizar seu nome.", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleLinkGoogleAccount = async () => {
    const result = await linkGoogleAccount();

    if (result.ok) {
      Swal.fire({
        icon: "success",
        title: result.alreadyLinked ? "Google já vinculado" : "Conta vinculada",
        text: result.alreadyLinked
          ? "Sua conta já podia entrar com Google."
          : "Agora você também pode entrar usando sua conta Google.",
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    Swal.fire({
      icon: "error",
      title: "Não foi possível vincular",
      text: result.message,
      confirmButtonColor: "#be123c",
    });
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Sair da conta?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#be123c",
      cancelButtonColor: "#cbd5e1",
      confirmButtonText: "Sair",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      await logout();
    }
  };

  if (authLoading || !user || entitlementLoading || (gardensLoading && gardens.length === 0)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rose-50">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-rose-200 border-t-rose-700" />
      </div>
    );
  }

  return (
    <GardenLayout>
      <div className="mx-auto max-w-7xl px-2 py-8 md:px-0">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="mb-3 inline-flex rounded-full border border-rose-100 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-rose-500">
              Dia dos Namorados
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950 md:text-5xl">
              Coleções para guardar o que fica
            </h1>
            <p className="mt-3 text-base leading-7 text-stone-600">
              Organize fotos, datas e frases em espaços privados para vocês dois.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex rounded-lg border border-rose-100 bg-white/85 p-1 shadow-sm">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setFilter(option.id)}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                    filter === option.id
                      ? "bg-rose-900 text-white shadow-sm"
                      : "text-stone-500 hover:bg-rose-50 hover:text-rose-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCreateGarden}
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-950/10 transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {hasAccess ? <FaPlus /> : <FaCreditCard />}
              {creating ? "Criando..." : hasAccess ? "Nova coleção" : "Comprar acesso"}
            </button>
          </div>
        </header>

        {!hasAccess && (
          <section className="mb-6 rounded-lg border border-amber-100 bg-amber-50/90 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <div className="mt-1 rounded-lg bg-white p-3 text-amber-700">
                  <FaLock />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-stone-950">
                    Compra única para criar seu Love Garden
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    Coleções compartilhadas continuam acessíveis. Para criar a sua, finalize o
                    pagamento pelo Mercado Pago.
                  </p>
                </div>
              </div>
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-800"
              >
                <FaCreditCard />
                Comprar acesso
              </Link>
            </div>
          </section>
        )}

        <UserAccountSection
          user={user}
          displayName={displayName}
          gardensCount={gardens.length}
          ownedCount={ownedCount}
          sharedCount={sharedCount}
          isGoogleLinked={isGoogleLinked}
          linkingGoogle={linkingGoogle}
          updatingProfile={updatingProfile}
          onCopyUserId={copyUserId}
          onEditDisplayName={handleEditDisplayName}
          onLinkGoogle={handleLinkGoogleAccount}
          onLogout={handleLogout}
        />

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-950">Suas coleções</h2>
            <span className="text-sm font-medium text-stone-500">
              {gardens.length} {gardens.length === 1 ? "coleção" : "coleções"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gardens.map((garden) => (
              <Link href={`/garden/${garden.id}`} key={garden.id} className="group">
                <article className="relative flex h-full min-h-[220px] flex-col rounded-lg border border-rose-100 bg-white/88 p-5 shadow-[0_18px_60px_rgba(127,29,29,0.07)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(127,29,29,0.12)]">
                  {garden.ownerId === user.uid && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        handleDeleteGarden(garden.id, garden.name);
                      }}
                      className="absolute right-4 top-4 rounded-md p-2 text-stone-300 transition hover:bg-red-50 hover:text-red-600"
                      title="Excluir coleção"
                    >
                      <FaTrash />
                    </button>
                  )}

                  <div
                    className="mb-5 h-2 w-20 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${garden.theme.primaryColor}, ${garden.theme.secondaryColor})`,
                    }}
                  />

                  <div className="mb-4 flex flex-wrap gap-2 pr-10">
                    <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                      {garden.ownerId === user.uid ? "Dono" : "Colaborador"}
                    </span>
                    <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-600">
                      {getThemeLabel(garden.theme.bgType)}
                    </span>
                  </div>

                  <h3 className="text-2xl font-semibold leading-tight text-stone-950">
                    {garden.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-stone-500">
                    Fotos, contador e frases reunidos em uma coleção privada.
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-rose-100 pt-4 text-sm font-bold text-rose-700">
                    <span>Abrir coleção</span>
                    <FaArrowRight className="transition group-hover:translate-x-1" />
                  </div>
                </article>
              </Link>
            ))}

            {gardens.length === 0 && !gardensLoading && (
              <div className="col-span-full rounded-lg border border-dashed border-rose-200 bg-white/70 px-6 py-14 text-center">
                <p className="text-xl font-semibold text-stone-950">
                  {hasAccess ? "Nenhuma coleção ainda" : "Seu acesso ainda não foi liberado"}
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                  {hasAccess
                    ? "Crie um espaço para reunir as fotos, datas e detalhes que fazem sentido para vocês."
                    : "Depois da aprovação do Mercado Pago, você poderá criar sua primeira coleção."}
                </p>
                <button
                  type="button"
                  onClick={handleCreateGarden}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-rose-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-800"
                >
                  {hasAccess ? <FaPlus /> : <FaCreditCard />}
                  {hasAccess ? "Criar primeira coleção" : "Comprar acesso"}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </GardenLayout>
  );
}
