"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fdf2f8] relative overflow-hidden flex flex-col">
      {/* Background Decor */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>

      <nav className="relative z-10 flex justify-between items-center p-6 md:px-12">
        <div className="text-2xl font-serif font-bold text-gray-800 flex items-center gap-2">
          <span>🌸</span> Garden
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-6 py-2 rounded-full text-gray-600 font-medium hover:bg-white/50 transition"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="px-6 py-2 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition shadow-lg shadow-gray-900/20"
          >
            Cadastrar
          </Link>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 relative z-10">
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
          Cultive Seus <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
            Belos Momentos
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-lg mb-12">
          Um espaço dedicado para plantar suas memórias, vê-las crescer e compartilhar seu jardim
          pessoal com quem você ama.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-none justify-center">
          <Link
            href="/register"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-lg hover:shadow-xl hover:shadow-pink-500/30 transition transform hover:-translate-y-1 block"
          >
            Começar a Plantar
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-2xl bg-white text-gray-800 font-bold text-lg border border-gray-200 hover:bg-gray-50 transition block"
          >
            Visitar Jardim
          </Link>
        </div>
      </main>

      <footer className="relative z-10 p-8 text-center text-gray-400 text-sm">
        © 2026 Love Garden. Feito com amor.
      </footer>
    </div>
  );
}
