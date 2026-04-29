"use client";

import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

/**
 * Public landing page for the application.
 * Highlights the main features and provides entry points for new and existing users.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-stone-950">
      <section className="relative flex min-h-[88vh] flex-col overflow-hidden">
        <Image src="/bg/floral-bg-v2.png" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.94)_0%,rgba(255,247,247,0.82)_48%,rgba(255,255,255,0.35)_100%)]" />

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
              href="/register"
              className="rounded-lg bg-rose-900 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-rose-950/10 transition hover:bg-rose-800"
            >
              Criar conta
            </Link>
          </div>
        </nav>

        <main className="relative z-10 flex flex-1 items-center px-5 pb-12 pt-10 md:px-10">
          <div className="max-w-3xl">
            <span className="mb-4 inline-flex rounded-full border border-rose-100 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-rose-500">
              Dia dos Namorados
            </span>
            <h1 className="text-5xl font-semibold tracking-tight text-rose-950 md:text-7xl">
              Love Garden
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600">
              Uma coleção privada para reunir fotos, datas importantes e frases que contam a
              história de vocês.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-950/10 transition hover:bg-rose-800"
              >
                Começar coleção
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
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
          {[
            ["Memórias", "Galerias privadas com legendas e autoria."],
            ["Datas", "Contadores para aniversários e marcos importantes."],
            ["Compartilhamento", "Convide quem participa da história."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-lg border border-rose-100 bg-white p-5">
              <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
