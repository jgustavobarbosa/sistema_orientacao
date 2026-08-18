'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState('');
  const [sucesso, setSucesso] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setErro('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        setErro('Ocorreu um erro ao processar sua solicitação.');
      } else {
        setSucesso(true);
      }
    } catch (err) {
      setErro('Falha na comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent px-6 py-12">
      {/* Vídeo de Fundo Dinâmico */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-15 pointer-events-none"
      >
        <source src="/video_SOIA.mp4" type="video/mp4" />
      </video>

      {/* Gradiente Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#030712]/40 via-transparent to-[#030712]/95 z-0 pointer-events-none" />

      {/* Box de Recuperação */}
      <div className="relative z-10 w-full max-w-md px-6 py-10 glass rounded-3xl shadow-2xl animate-slide-right">
        
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <img 
            src="/kit-identidade/soia-app-icon.svg" 
            alt="SOIA App Icon" 
            className="h-12 w-12 object-contain"
          />
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-100">
              Recuperar Senha
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              Informe seu e-mail cadastrado para redefinir suas credenciais
            </p>
          </div>
        </div>

        {erro && (
          <div className="flex items-start gap-3 p-4 mb-5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs animate-in fade-in duration-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <div>
              <h4 className="font-semibold text-red-400">Falha ao processar</h4>
              <p className="mt-0.5 text-slate-350">{erro}</p>
            </div>
          </div>
        )}

        {sucesso ? (
          <div className="space-y-6 text-center py-4 animate-in fade-in duration-350">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-450" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-200">Solicitação Enviada!</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Se este e-mail estiver cadastrado na plataforma, geramos uma rota de redefinição de senha. **Verifique o link de redefinição gerado no console do servidor** para redefinir seus dados de acesso.
              </p>
            </div>
            <Link 
              href="/login" 
              className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all duration-300 text-center cursor-pointer"
            >
              Voltar ao Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                E-mail Cadastrado
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: orientando@universidade.edu.br"
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none placeholder:text-slate-855"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="group relative flex w-full items-center justify-between gap-3 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Processando...' : 'Solicitar Link de Redefinição'}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="pt-4 border-t border-slate-900/60 text-center">
              <Link 
                href="/login" 
                className="text-xs text-blue-450 hover:text-blue-400 font-bold transition-colors"
              >
                Voltar para o Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
