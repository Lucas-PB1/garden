"use client";

import { useAuth } from "@/context/AuthContext";
import { createCheckout, fetchCommerceConfig } from "@/features/commerce/services/checkoutService";
import type { PublicCommerceConfig } from "@/features/commerce/types";
import { formatCurrencyFromCents } from "@/features/commerce/utils/formatCurrency";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { FaArrowLeft, FaCreditCard, FaLock } from "react-icons/fa";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<PublicCommerceConfig | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [dedication, setDedication] = useState("");
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const suggestedBuyerName = user?.displayName || user?.email?.split("@")[0] || "";

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/register?callbackUrl=/checkout");
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    let active = true;

    fetchCommerceConfig()
      .then((nextConfig) => {
        if (active) setConfig(nextConfig);
      })
      .catch((fetchError) => {
        console.error(fetchError);
        if (active) setError("Não foi possível carregar os dados da compra.");
      })
      .finally(() => {
        if (active) setLoadingConfig(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !config?.active) return;

    setSubmitting(true);
    setError("");

    try {
      const checkout = await createCheckout(user, {
        buyerName: buyerName || suggestedBuyerName,
        partnerName,
        dedication,
      });
      window.location.href = checkout.checkoutUrl;
    } catch (checkoutError) {
      console.error(checkoutError);
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Não foi possível iniciar o pagamento.",
      );
      setSubmitting(false);
    }
  };

  if (authLoading || !user || loadingConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rose-50">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-rose-200 border-t-rose-700" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff8f5] text-stone-950">
      <Image src="/bg/floral-bg-v2.png" alt="" fill priority className="object-cover opacity-80" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.96)_0%,rgba(255,247,237,0.88)_52%,rgba(236,253,245,0.70)_100%)]" />

      <main className="relative z-10 mx-auto grid min-h-screen max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-10">
        <section>
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-stone-500 transition hover:text-rose-800"
          >
            <FaArrowLeft className="text-xs" />
            Voltar
          </Link>

          <span className="mb-4 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
            Compra única
          </span>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-rose-950 md:text-6xl">
            Seu Love Garden pronto para o Dia dos Namorados.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-stone-600">
            O pagamento é processado pelo Mercado Pago. O acesso só é liberado depois da confirmação
            oficial do pagamento no servidor.
          </p>

          <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-white/80 bg-white/82 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">Valor</p>
              <p className="mt-2 text-3xl font-semibold text-stone-950">
                {config ? formatCurrencyFromCents(config.priceCents, config.currencyId) : "--"}
              </p>
            </div>
            <div className="rounded-lg border border-white/80 bg-white/82 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">
                Produto
              </p>
              <p className="mt-2 text-lg font-semibold text-stone-950">{config?.productName}</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-white/80 bg-white/92 p-5 shadow-[0_24px_90px_rgba(127,29,29,0.12)] backdrop-blur md:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Finalizar</h2>
              <p className="mt-1 text-sm text-stone-500">{user.email}</p>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-rose-800">
              <FaLock />
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {!config?.active ? (
            <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              As vendas estão pausadas no momento.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">Seu nome</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(event) => setBuyerName(event.target.value)}
                  maxLength={80}
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-stone-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-200"
                  placeholder={suggestedBuyerName}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Nome da pessoa amada
                </label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(event) => setPartnerName(event.target.value)}
                  maxLength={80}
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-stone-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-200"
                  placeholder="Opcional"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Dedicação inicial
                </label>
                <textarea
                  value={dedication}
                  onChange={(event) => setDedication(event.target.value)}
                  maxLength={240}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-stone-200 bg-white px-4 py-3 text-stone-800 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-200"
                  placeholder="Opcional"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-rose-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-950/10 transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FaCreditCard />
                {submitting ? "Abrindo checkout..." : "Pagar com Mercado Pago"}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
