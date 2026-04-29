"use client";

import { useAuth } from "@/context/AuthContext";
import { fetchCheckoutStatus } from "@/features/commerce/services/checkoutService";
import type { CheckoutOrderStatus } from "@/features/commerce/types";
import { formatCurrencyFromCents } from "@/features/commerce/utils/formatCurrency";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FaArrowRight, FaClock, FaExclamationTriangle, FaHeart } from "react-icons/fa";

type CheckoutReturnKind = "success" | "pending" | "failure";

const finalStatuses = new Set([
  "approved",
  "amount_mismatch",
  "rejected",
  "cancelled",
  "refunded",
  "charged_back",
]);

const getStatusCopy = (kind: CheckoutReturnKind, order: CheckoutOrderStatus | null) => {
  if (order?.status === "approved") {
    return {
      icon: <FaHeart />,
      title: "Pagamento aprovado",
      text: "Seu acesso foi liberado. Agora é só criar a coleção.",
      tone: "text-emerald-700",
    };
  }

  if (order?.status === "amount_mismatch") {
    return {
      icon: <FaExclamationTriangle />,
      title: "Pagamento em análise",
      text: "O valor confirmado não bate com o pedido, então o acesso não foi liberado automaticamente.",
      tone: "text-amber-700",
    };
  }

  if (kind === "failure" || order?.status === "rejected" || order?.status === "cancelled") {
    return {
      icon: <FaExclamationTriangle />,
      title: "Pagamento não concluído",
      text: "Você pode tentar novamente quando quiser.",
      tone: "text-red-600",
    };
  }

  return {
    icon: <FaClock />,
    title: "Aguardando confirmação",
    text: "O Mercado Pago ainda está processando o pagamento. Esta página atualiza sozinha.",
    tone: "text-rose-800",
  };
};

export default function CheckoutReturnPage({ kind }: { kind: CheckoutReturnKind }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const [order, setOrder] = useState<CheckoutOrderStatus | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?callbackUrl=/checkout/${kind}?orderId=${encodeURIComponent(orderId)}`);
    }
  }, [authLoading, kind, orderId, router, user]);

  useEffect(() => {
    if (!user || !orderId) {
      setLoading(false);
      return;
    }

    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const loadStatus = async () => {
      try {
        const nextOrder = await fetchCheckoutStatus(user, orderId);
        if (!active) return;
        setOrder(nextOrder);
        setError("");

        if (finalStatuses.has(nextOrder.status) && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch (statusError) {
        console.error(statusError);
        if (active) setError("Não foi possível consultar este pedido.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadStatus();
    intervalId = setInterval(loadStatus, 4000);

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderId, user]);

  const copy = useMemo(() => getStatusCopy(kind, order), [kind, order]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rose-50">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-rose-200 border-t-rose-700" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fff7f7_0%,#f0fdfa_100%)] px-5 py-10 text-stone-950">
      <main className="w-full max-w-xl rounded-lg border border-white/80 bg-white/92 p-6 shadow-[0_24px_90px_rgba(127,29,29,0.12)] backdrop-blur md:p-8">
        <div className={`mb-5 inline-flex rounded-lg bg-white p-3 text-2xl shadow-sm ${copy.tone}`}>
          {copy.icon}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950">{copy.title}</h1>
        <p className="mt-3 text-base leading-7 text-stone-600">{copy.text}</p>

        {error && (
          <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {order ? (
          <div className="mt-6 rounded-lg border border-stone-100 bg-stone-50 p-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-stone-500">Pedido</span>
              <span className="font-mono text-xs text-stone-600">{order.id}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="font-semibold text-stone-500">Status</span>
              <span className="font-bold text-stone-900">{order.status}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="font-semibold text-stone-500">Valor esperado</span>
              <span className="font-bold text-stone-900">
                {formatCurrencyFromCents(order.expectedAmountCents, order.currencyId)}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            Pedido não encontrado no retorno do checkout.
          </div>
        )}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {order?.status === "approved" ? (
            <Link
              href="/dashboard"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-800"
            >
              Abrir painel
              <FaArrowRight className="text-xs" />
            </Link>
          ) : (
            <Link
              href="/checkout"
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-rose-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-800"
            >
              Tentar novamente
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
          >
            Voltar ao início
          </Link>
        </div>
      </main>
    </div>
  );
}
