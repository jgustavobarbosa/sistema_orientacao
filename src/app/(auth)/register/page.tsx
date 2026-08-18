'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  const [nome, setNome] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [whatsapp, setWhatsapp] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState('');
  const [sucesso, setSucesso] = React.useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !senha) return;
    setLoading(true);
    setErro('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, whatsapp, senha }),
      });

      if (!res.ok) {
        const text = await res.text();
        setErro(text || 'Ocorreu um erro ao registrar sua conta.');
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

      {/* Box de Cadastro */}
      <div className="relative z-10 w-full max-w-md px-6 py-10 glass rounded-3xl shadow-2xl animate-slide-right">
        
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <img 
            src="/kit-identidade/soia-app-icon.svg" 
            alt="SOIA App Icon" 
            className="h-12 w-12 object-contain"
          />
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-100">
              Registrar no SOIA
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              Preencha suas informações para solicitar acesso acadêmico
            </p>
          </div>
        </div>

        {erro && (
          <div className="flex items-start gap-3 p-4 mb-5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs animate-in fade-in duration-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <div>
              <h4 className="font-semibold text-red-400">Falha ao registrar</h4>
              <p className="mt-0.5 text-slate-350">{erro}</p>
            </div>
          </div>
        )}

        {sucesso ? (
          <div className="space-y-6 text-center py-4 animate-in fade-in duration-350">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-200">Cadastro efetuado com sucesso!</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Um link de verificação foi emitido. Como estamos em ambiente simulado de testes, **copie o link de ativação impresso no console do servidor** e navegue até ele para confirmar seu e-mail.
              </p>
            </div>
            <Link 
              href="/login" 
              className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all duration-300 text-center cursor-pointer"
            >
              Ir para o Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="nome" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Nome Completo
              </label>
              <input
                type="text"
                id="nome"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome acadêmico"
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none placeholder:text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                E-mail Acadêmico
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: orientando@universidade.edu.br"
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none placeholder:text-slate-850"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="whatsapp" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                WhatsApp / Telefone
              </label>
              <input
                type="text"
                id="whatsapp"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="ex: (11) 99999-9999"
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none placeholder:text-slate-850"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="senha" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Senha de Acesso
              </label>
              <input
                type="password"
                id="senha"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none placeholder:text-slate-850"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !nome || !email || !senha}
              className="group relative flex w-full items-center justify-between gap-3 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Cadastrando...' : 'Registrar Solicitação'}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="pt-4 border-t border-slate-900/60 text-center">
              <p className="text-xs text-slate-500">
                Já possui uma conta?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
                >
                  Faça Login
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
