import type { User } from "firebase/auth";
import { FaCheckCircle, FaCopy, FaEnvelope, FaIdCard, FaPen, FaSignOutAlt } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

interface UserAccountSectionProps {
  user: User;
  displayName: string;
  gardensCount: number;
  ownedCount: number;
  sharedCount: number;
  isGoogleLinked: boolean;
  linkingGoogle: boolean;
  updatingProfile: boolean;
  onCopyUserId: () => void;
  onEditDisplayName: () => void;
  onLinkGoogle: () => void;
  onLogout: () => void;
}

const getProviderLabel = (providerId: string) => {
  if (providerId === "google.com") return "Google";
  if (providerId === "password") return "E-mail";
  return providerId;
};

export default function UserAccountSection({
  user,
  displayName,
  gardensCount,
  ownedCount,
  sharedCount,
  isGoogleLinked,
  linkingGoogle,
  updatingProfile,
  onCopyUserId,
  onEditDisplayName,
  onLinkGoogle,
  onLogout,
}: UserAccountSectionProps) {
  const providerLabels = user.providerData.map((provider) => getProviderLabel(provider.providerId));
  const uniqueProviderLabels =
    providerLabels.length > 0 ? Array.from(new Set(providerLabels)) : ["Firebase"];
  const initial = (displayName || user.email || "G").charAt(0).toUpperCase();

  return (
    <section className="mb-10 rounded-lg border border-rose-100 bg-white/88 p-5 shadow-[0_18px_60px_rgba(127,29,29,0.08)] backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-rose-950 text-2xl font-semibold text-white shadow-lg shadow-rose-950/10">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-500">
                Dados do usuário
              </span>
              {isGoogleLinked && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <FaCheckCircle className="text-emerald-500" />
                  Google vinculado
                </span>
              )}
            </div>

            <h2 className="truncate text-2xl font-semibold text-stone-950">{displayName}</h2>

            <div className="mt-2 flex flex-col gap-1 text-sm text-stone-500">
              <span className="inline-flex min-w-0 items-center gap-2">
                <FaEnvelope className="shrink-0 text-rose-300" />
                <span className="truncate">{user.email || "E-mail não informado"}</span>
              </span>
              <span className="inline-flex min-w-0 items-center gap-2">
                <FaIdCard className="shrink-0 text-rose-300" />
                <code className="truncate font-mono text-xs text-stone-500">{user.uid}</code>
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {uniqueProviderLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-600"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-rose-100 sm:min-w-[300px]">
          {[
            { label: "Jardins", value: gardensCount },
            { label: "Seus", value: ownedCount },
            { label: "Compart.", value: sharedCount },
          ].map((item) => (
            <div key={item.label} className="px-3 py-2 text-center">
              <div className="text-xl font-semibold text-rose-950">{item.value}</div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-rose-400">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-rose-100 pt-4">
        <button
          type="button"
          onClick={onEditDisplayName}
          disabled={updatingProfile}
          className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-rose-200 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <FaPen className="text-rose-400" />
          {updatingProfile ? "Salvando..." : "Editar nome"}
        </button>

        <button
          type="button"
          onClick={onCopyUserId}
          className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-rose-200 hover:text-rose-700"
        >
          <FaCopy className="text-rose-400" />
          Copiar ID
        </button>

        <button
          type="button"
          onClick={onLinkGoogle}
          disabled={isGoogleLinked || linkingGoogle}
          className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 transition hover:border-emerald-200 hover:text-emerald-700 disabled:cursor-default disabled:opacity-75"
        >
          {isGoogleLinked ? <FaCheckCircle className="text-emerald-500" /> : <FcGoogle />}
          {linkingGoogle
            ? "Vinculando..."
            : isGoogleLinked
              ? "Google vinculado"
              : "Vincular Google"}
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="ml-auto inline-flex items-center gap-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          <FaSignOutAlt />
          Sair
        </button>
      </div>
    </section>
  );
}
