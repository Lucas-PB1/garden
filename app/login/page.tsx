"use client";

import { useLogin } from "@/hooks/useLogin";
import Link from "next/link";

export default function LoginPage() {
  const { email, setEmail, password, setPassword, error, handleLogin } = useLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf2f8] relative overflow-hidden">
      {/* Floral Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.05)] w-full max-w-md border border-white/50 relative z-10 mx-4">
        <div className="text-center mb-8">
          <span className="text-4xl mb-2 block">🌿</span>
          <h1 className="text-3xl font-serif font-bold text-gray-800 mb-2">Bem-vindo de Volta</h1>
          <p className="text-gray-500 text-sm">Entre no seu jardim secreto</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2 ml-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all shadow-sm"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2 ml-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent transition-all shadow-sm"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-400 to-green-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-green-400/30 transition transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Entrar no Jardim
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Primeira vez aqui?{" "}
            <Link
              href="/register"
              className="text-emerald-500 font-semibold hover:text-emerald-600 transition"
            >
              Cresça conosco
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
