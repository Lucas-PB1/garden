"use client";

import BrandLogo from "@/components/brand/BrandLogo";
import { fetchCommerceConfig } from "@/features/commerce/services/checkoutService";
import type { PublicCommerceConfig } from "@/features/commerce/types";
import { formatCurrencyFromCents } from "@/features/commerce/utils/formatCurrency";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaCalendarAlt,
  FaCreditCard,
  FaHeart,
  FaImages,
  FaLock,
  FaQuoteLeft,
  FaSeedling,
  FaShieldAlt,
} from "react-icons/fa";

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
    <div className="min-h-screen bg-cream text-stone-950">
      <section className="relative flex min-h-[86vh] flex-col overflow-hidden">
        <Image src="/bg/floral-bg-v2.png" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(255,255,255,0.96)_0%,rgba(255,247,237,0.88)_52%,rgba(236,253,245,0.45)_100%)]" />

        <nav className="relative z-10 flex items-center justify-between px-5 py-5 md:px-10">
          <BrandLogo />
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className="whitespace-nowrap rounded-lg px-3 py-2 sm:px-4 text-sm font-semibold text-stone-600 transition hover:bg-white/70 hover:text-rose-800"
            >
              Entrar
            </Link>
            <Link
              href="/checkout"
              className="whitespace-nowrap rounded-lg bg-rose-900 px-3 py-2 text-sm font-bold text-white shadow-lg shadow-rose-950/10 transition hover:bg-rose-800 sm:px-4"
            >
              <span className="sm:hidden">Começar</span>
              <span className="hidden sm:inline">Criar o nosso</span>
            </Link>
          </div>
        </nav>

        <main className="relative z-10 flex flex-1 items-center px-5 pb-12 pt-10 md:px-10">
          <div className="max-w-3xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-leaf">
              <FaSeedling />
              Compra única · Dia dos Namorados
            </span>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight text-brand-ink md:text-7xl">
              Um jardim para as <span className="italic text-rose-700">memórias</span> de vocês.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">
              O Love Garden é um site privado para reunir fotos, a contagem do tempo juntos e as
              frases que só vocês entendem. Cada memória plantada faz o jardim crescer.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/80 bg-white/88 px-4 py-3 text-sm font-bold text-stone-800 shadow-sm">
                <FaCreditCard className="text-rose-700" />
                {config
                  ? formatCurrencyFromCents(config.priceCents, config.currencyId)
                  : "Carregando valor"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/80 bg-white/88 px-4 py-3 text-sm font-bold text-stone-800 shadow-sm">
                <FaShieldAlt className="text-leaf" />
                Pagamento seguro via Mercado Pago
              </span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-950/10 transition hover:bg-rose-800"
              >
                Plantar nosso jardim
                <FaArrowRight className="text-xs" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-rose-100 bg-white/85 px-6 py-3 text-sm font-bold text-stone-700 transition hover:border-rose-200 hover:text-rose-800"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </main>
      </section>

      <section className="px-5 py-16 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">
              O que cabe no jardim
            </span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-brand-ink md:text-4xl">
              Tudo o que conta a história de vocês, em um só lugar.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: <FaImages />,
                title: "Álbum de memórias",
                description:
                  "Fotos com data e autoria, em uma galeria bonita e uma apresentação em tela cheia.",
              },
              {
                icon: <FaCalendarAlt />,
                title: "Tempo juntos",
                description:
                  "Um contador ao vivo desde o primeiro encontro — ou até a próxima data especial.",
              },
              {
                icon: <FaQuoteLeft />,
                title: "Frases de vocês",
                description:
                  "Declarações que aparecem junto de cada foto, do jeito que só vocês falam.",
              },
            ].map(({ icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-rose-100 bg-white p-6 shadow-[0_18px_60px_rgba(76,5,25,0.05)]"
              >
                <div className="mb-5 inline-flex rounded-xl bg-rose-50 p-3 text-rose-800">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold text-brand-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 md:grid-cols-3">
            {[
              { icon: <FaLock />, text: "Privado: só entra quem vocês convidarem." },
              { icon: <FaHeart />, text: "Feito para dois — e para quem vocês quiserem incluir." },
              { icon: <FaShieldAlt />, text: "Acesso liberado após confirmação do pagamento." },
            ].map(({ icon, text }) => (
              <p key={text} className="flex items-start gap-3 text-sm font-medium text-stone-700">
                <span className="mt-0.5 text-leaf">{icon}</span>
                {text}
              </p>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-rose-100 px-5 py-8 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <BrandLogo size="sm" />
          <p className="text-sm text-stone-500">Feito com carinho para guardar o que fica.</p>
        </div>
      </footer>
    </div>
  );
}
