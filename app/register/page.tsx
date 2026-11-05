"use client";

import BrandLogo from "@/components/brand/BrandLogo";
import { useRegister } from "@/features/auth/hooks/useRegister";
import Image from "next/image";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

/**
 * Registration page component.
 * Enables new users to create an account and start their own memory collection.
 */
export default function RegisterPage() {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    isSubmitting,
    isGoogleSubmitting,
    handleRegister,
    handleGoogleRegister,
  } = useRegister();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-10">
      <Image src="/bg/floral-bg-v2.png" alt="" fill priority className="object-cover opacity-70" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,250,246,0.82)_0%,rgba(255,241,242,0.9)_60%,rgba(255,250,246,0.96)_100%)]" />
      <div className="relative w-full max-w-md rounded-2xl border border-rose-100 bg-white/92 p-7 shadow-[0_24px_80px_rgba(76,5,25,0.12)] backdrop-blur">
        <div className="mb-8 text-center">
          <BrandLogo className="mb-6" />
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-brand-ink">
            Plante o jardim de vocês
          </h1>
          <p className="text-sm text-stone-500">Comece um espaço privado para vocês dois.</p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 ml-1 block text-sm font-semibold text-stone-700">
              Seu nome
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-stone-800 shadow-sm transition-all placeholder:text-stone-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Como você quer ser chamado(a)"
              disabled={isSubmitting || isGoogleSubmitting}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 ml-1 block text-sm font-semibold text-stone-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-stone-800 shadow-sm transition-all placeholder:text-stone-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="voce@email.com"
              disabled={isSubmitting || isGoogleSubmitting}
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-2 ml-1 block text-sm font-semibold text-stone-700"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-stone-800 shadow-sm transition-all placeholder:text-stone-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Mínimo de 6 caracteres"
              disabled={isSubmitting || isGoogleSubmitting}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full rounded-lg bg-rose-900 py-3.5 font-bold text-white shadow-lg shadow-rose-950/10 transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-rose-100" />
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">ou</span>
          <div className="h-px flex-1 bg-rose-100" />
        </div>

        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={isSubmitting || isGoogleSubmitting}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-stone-200 bg-white px-5 py-3 font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <FcGoogle className="text-xl shrink-0" aria-hidden />
          {isGoogleSubmitting ? "Conectando..." : "Continuar com Google"}
        </button>

        <div className="mt-8 text-center">
          <p className="text-sm text-stone-500">
            Já tem um jardim?{" "}
            <Link
              href="/login"
              className="font-semibold text-rose-700 transition hover:text-rose-800"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
