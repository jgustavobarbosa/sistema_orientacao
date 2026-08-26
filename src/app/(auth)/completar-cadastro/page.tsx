'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';
import Link from 'next/link';

function CompletarCadastroContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [senha, setSenha] = React.useState('');
  const [senha2, setSenha2] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState('');
  const [sucesso, setSucesso] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== senha2) {
      setErro('As senhas não conferem.');
      return;
    }
    setLoading(true);
    setErro('');

    try {
      const res = await fetch('/api/auth/completar-cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || 'Erro ao criar senha.');
      } else {
        setSucesso(true);
      }
    } catch (err) {
      setErro('Falha na comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-8 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">Link Inválido</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          O link de ativação está incompleto. Verifique o link no e-mail que você recebeu.
        </p>
        <Link href="/login" className="inline-block py-2 px-4 bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-800">
          Ir para o Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {erro && (
        <div className="flex items-start gap-3 p-4 mb-5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <h4 className="font-semibold text-red-400">Não foi possível criar a senha</h4>
            <p className="mt-0.5">{erro}</p>
          </div>
        </div>
      )}

      {sucesso ? (
        <div className="space-y-6 text-center py-4 animate-in fade-in duration-350">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-200">Senha Criada!</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sua senha foi cadastrada com sucesso. Agora você pode acessar a plataforma.
            </p>
          </div>
          <Link href="/login" className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all text-center cursor-pointer">
            Ir para o Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 justify-center mb-6">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <KeyRound className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400">Crie sua senha de acesso</p>
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="senha" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nova Senha</label>
            <input type="password" id="senha" required value={senha} onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none placeholder:text-slate-850" />
          </div>
          <div className="space-y-1">
            <label htmlFor="senha2" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repetir Senha</label>
            <input type="password" id="senha2" required value={senha2} onChange={(e) => setSenha2(e.target.value)}
              placeholder="Digite a senha novamente"
              className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none placeholder:text-slate-850" />
          </div>
          <button type="submit" disabled={loading || !senha || !senha2}
            className="group relative flex w-full items-center justify-between gap-3 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50">
            <span>{loading ? 'Salvando...' : 'Criar Minha Senha'}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      )}
    </div>
  );
}

export default function CompletarCadastroPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent px-6 py-12">
      <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-15 pointer-events-none">
        <source src="/video_SOIA.mp4" type="video/mp4" />
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#030712]/40 via-transparent to-[#030712]/95 z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6 py-10 glass rounded-3xl shadow-2xl animate-slide-right">
        <div className="flex flex-col items-center text-center space-y-4 mb-2">
          <img src="/kit-identidade/soia-app-icon.svg" alt="SOIA" className="h-12 w-12 object-contain" />
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-100">Completar Cadastro</h2>
            <p className="text-[10px] text-slate-400 mt-1">Defina sua senha para acessar o SOIA</p>
          </div>
        </div>

        <Suspense fallback={<div className="text-center text-slate-400 text-xs py-8">Carregando...</div>}>
          <CompletarCadastroContent />
        </Suspense>
      </div>
    </div>
  );
}