import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* Círculos de Fundo Estilo Blur */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-6 py-12 glass rounded-2xl shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
            <ShieldAlert className="h-10 w-10 animate-bounce" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-red-400">
            Falha na Autenticação
          </h1>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            Não foi possível validar suas credenciais ou você não possui permissão para acessar esta área.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 rounded-xl transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}
