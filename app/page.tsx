"use client";

import { fetchCommerceConfig } from "@/features/commerce/services/checkoutService";
import type { PublicCommerceConfig } from "@/features/commerce/types";
import { formatCurrencyFromCents } from "@/features/commerce/utils/formatCurrency";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowRight, FaCreditCard, FaHeart, FaLock, FaShieldAlt } from "react-icons/fa";

/**
 * Public landing page for the application.
 * Highlights the main features and provides entry points for new and existing users.
 */
export default function LandingPage() {
  const [config, setConfig] = useState<PublicCommerceConfig | null>(null);

  useEffect(() => {
    let active = true;

    fetchCommerceConfig()
      .then((nextConfig) => {
        if (active) setConfig(nextConfig);
      })
      .catch((error) => console.error("Commerce config fetch failed", error));

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fffdfb] text-stone-950">
      <section className="relative flex min-h-[86vh] flex-col overflow-hidden">
        <Image src="/bg/floral-bg-v2.png" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(255,255,255,0.96)_0%,rgba(255,247,237,0.88)_52%,rgba(236,253,245,0.45)_100%)]" />

        <nav className="relative z-10 flex items-center justify-between px-5 py-5 md:px-10">
          <Link href="/" className="text-lg font-semibold tracking-tight text-rose-950">
            Love Garden
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-white/70 hover:text-rose-800"
            >
              Entrar
            </Link>
            <Link
              href="/checkout"
              className="rounded-lg bg-rose-900 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-rose-950/10 transition hover:bg-rose-800"
            >
              Comprar
            </Link>
          </div>
        </nav>

        <main className="relative z-10 flex flex-1 items-center px-5 pb-12 pt-10 md:px-10">
          <div className="max-w-3xl">
            <span className="mb-4 inline-flex rounded-full border border-emerald-100 bg-emerald-50/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Compra única para o Dia dos Namorados
            </span>
            <h1 className="text-5xl font-semibold tracking-tight text-rose-950 md:text-7xl">
              Love Garden
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600">
              Um site privado para reunir fotos, datas importantes e frases que contam a história de
              vocês, com acesso liberado depois do pagamento confirmado.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/80 bg-white/88 px-4 py-3 text-sm font-bold text-stone-800 shadow-sm">
                <FaCreditCard className="text-rose-700" />
                {config
                  ? formatCurrencyFromCents(config.priceCents, config.currencyId)
                  : "Carregando valor"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/80 bg-white/88 px-4 py-3 text-sm font-bold text-stone-800 shadow-sm">
                <FaShieldAlt className="text-emerald-700" />
                Mercado Pago
              </span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-950/10 transition hover:bg-rose-800"
              >
                Comprar acesso
                <FaArrowRight className="text-xs" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-rose-100 bg-white/85 px-6 py-3 text-sm font-bold text-stone-700 transition hover:border-rose-200 hover:text-rose-800"
              >
                Acessar conta
              </Link>
            </div>
          </div>
        </main>
      </section>

      <section className="px-5 py-10 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-4">
          {[
            {
              icon: <FaHeart />,
              title: "Memórias",
              description: "Galerias privadas com legendas e autoria.",
            },
            {
              icon: <FaLock />,
              title: "Privado",
              description: "A conta controla quem pode entrar na coleção.",
            },
            {
              icon: <FaShieldAlt />,
              title: "Seguro",
              description: "O acesso depende do pagamento confirmado no servidor.",
            },
            {
              icon: <FaCreditCard />,
              title: "Pagamento",
              description: "Checkout hospedado pelo Mercado Pago.",
            },
          ].map(({ icon, title, description }) => (
            <div key={title} className="rounded-lg border border-rose-100 bg-white p-5">
              <div className="mb-4 inline-flex rounded-lg bg-rose-50 p-3 text-rose-800">{icon}</div>
              <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
