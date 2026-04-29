"use client";

import { useRegister } from "@/features/auth/hooks/useRegister";
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
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fff7f7_0%,#fff1f2_52%,#ffffff_100%)] px-4">
      <div className="relative w-full max-w-md rounded-lg border border-rose-100 bg-white/90 p-7 shadow-[0_24px_80px_rgba(127,29,29,0.10)] backdrop-blur">
        <div className="mb-8 text-center">
          <span className="mb-3 inline-flex rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-rose-500">
            Love Garden
          </span>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-stone-950">
            Crie sua coleção
          </h1>
          <p className="text-sm text-stone-500">Comece um espaço privado para vocês dois.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="mb-2 ml-1 block text-sm font-semibold text-stone-700">Seu nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-stone-800 shadow-sm transition-all placeholder:text-stone-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Rose"
              disabled={isSubmitting || isGoogleSubmitting}
              required
            />
          </div>
          <div>
            <label className="mb-2 ml-1 block text-sm font-semibold text-stone-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-stone-800 shadow-sm transition-all placeholder:text-stone-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="rose@garden.com"
              disabled={isSubmitting || isGoogleSubmitting}
              required
            />
          </div>
          <div>
            <label className="mb-2 ml-1 block text-sm font-semibold text-stone-700">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-stone-800 shadow-sm transition-all placeholder:text-stone-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="••••••••"
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
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">ou</span>
          <div className="h-px flex-1 bg-gray-200" />
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
            Já tem um lugar?{" "}
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
