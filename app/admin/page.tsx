"use client";

import { useAuth } from "@/context/AuthContext";
import {
  fetchAdminCommerce,
  updateAdminCommerce,
} from "@/features/commerce/services/checkoutService";
import type { AdminCommerceConfig, CommerceOrderSummary } from "@/features/commerce/types";
import { formatCurrencyFromCents } from "@/features/commerce/utils/formatCurrency";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { FaArrowLeft, FaSave, FaShieldAlt, FaSyncAlt } from "react-icons/fa";

const emptyConfig: AdminCommerceConfig = {
  productName: "",
  description: "",
  priceCents: 10,
  currencyId: "BRL",
  active: true,
  binaryMode: false,
  statementDescriptor: "LOVEGARDEN",
};

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<AdminCommerceConfig>(emptyConfig);
  const [orders, setOrders] = useState<CommerceOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const loadAdmin = async () => {
    if (!user) return;

    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminCommerce(user);
      setConfig(data.config);
      setOrders(data.orders);
    } catch (loadError) {
      console.error(loadError);
      setError(loadError instanceof Error ? loadError.message : "Não foi possível abrir o admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?callbackUrl=/admin");
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    loadAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");
    setSavedMessage("");

    try {
      const data = await updateAdminCommerce(user, config);
      setConfig(data.config);
      setOrders(data.orders);
      setSavedMessage("Configuração salva.");
    } catch (saveError) {
      console.error(saveError);
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-stone-200 border-t-rose-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7f7_0%,#ffffff_42%,#ecfeff_100%)] px-5 py-8 text-stone-950 md:px-10">
      <main className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-stone-500 transition hover:text-rose-800"
            >
              <FaArrowLeft className="text-xs" />
              Voltar ao painel
            </Link>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-rose-900 p-3 text-white">
                <FaShieldAlt />
              </div>
              <div>
                <h1 className="text-4xl font-semibold tracking-tight">Admin</h1>
                <p className="mt-1 text-sm text-stone-500">Configuração comercial e pedidos.</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={loadAdmin}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
          >
            <FaSyncAlt className="text-xs" />
            Atualizar
          </button>
        </header>

        {error && (
          <div className="mb-5 rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {savedMessage && (
          <div className="mb-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            {savedMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-white/80 bg-white/92 p-5 shadow-sm"
          >
            <h2 className="text-xl font-semibold">Venda</h2>
            <p className="mt-1 text-sm text-stone-500">
              Valor atual: {formatCurrencyFromCents(config.priceCents, config.currencyId)}
            </p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-stone-700">Produto</span>
                <input
                  type="text"
                  value={config.productName}
                  onChange={(event) => setConfig({ ...config, productName: event.target.value })}
                  maxLength={100}
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-stone-700">Descrição</span>
                <textarea
                  value={config.description}
                  onChange={(event) => setConfig({ ...config, description: event.target.value })}
                  maxLength={500}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-stone-200 bg-white px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-stone-700">
                  Preço em centavos
                </span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={config.priceCents}
                  onChange={(event) =>
                    setConfig({ ...config, priceCents: Number(event.target.value) })
                  }
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-stone-700">
                  Descritor da fatura
                </span>
                <input
                  type="text"
                  value={config.statementDescriptor}
                  onChange={(event) =>
                    setConfig({ ...config, statementDescriptor: event.target.value })
                  }
                  maxLength={22}
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-stone-100 bg-stone-50 p-4">
                <span>
                  <span className="block text-sm font-semibold text-stone-800">Vendas ativas</span>
                  <span className="block text-xs text-stone-500">
                    Liga ou pausa novos checkouts.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={config.active}
                  onChange={(event) => setConfig({ ...config, active: event.target.checked })}
                  className="h-5 w-5 accent-rose-800"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-stone-100 bg-stone-50 p-4">
                <span>
                  <span className="block text-sm font-semibold text-stone-800">Modo binário</span>
                  <span className="block text-xs text-stone-500">
                    Evita estados intermediários quando habilitado no Mercado Pago.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={config.binaryMode}
                  onChange={(event) => setConfig({ ...config, binaryMode: event.target.checked })}
                  className="h-5 w-5 accent-rose-800"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-rose-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FaSave />
              {saving ? "Salvando..." : "Salvar configuração"}
            </button>
          </form>

          <section className="rounded-lg border border-white/80 bg-white/92 p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Pedidos recentes</h2>
                <p className="mt-1 text-sm text-stone-500">{orders.length} registros</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-xs uppercase tracking-[0.14em] text-stone-400">
                    <th className="py-3 pr-4">Pedido</th>
                    <th className="py-3 pr-4">Cliente</th>
                    <th className="py-3 pr-4">Valor</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Criado em</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-stone-100">
                      <td className="py-4 pr-4 font-mono text-xs text-stone-600">{order.id}</td>
                      <td className="py-4 pr-4 text-stone-700">
                        {order.userEmail || order.userId}
                      </td>
                      <td className="py-4 pr-4 font-semibold text-stone-900">
                        {formatCurrencyFromCents(order.expectedAmountCents, order.currencyId)}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-stone-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString("pt-BR") : "--"}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-stone-500">
                        Nenhum pedido registrado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
