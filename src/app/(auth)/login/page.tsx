'use client';

import React, { Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GraduationCap, AlertCircle, ArrowRight } from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const error = searchParams.get('error');

  const [emailDev, setEmailDev] = React.useState('');
  const [loadingDev, setLoadingDev] = React.useState(false);

  // Se já estiver logado, redirecionar para a home que decidirá o destino, a menos que haja erro ativo
  React.useEffect(() => {
    if (status === 'authenticated' && !error) {
      router.push('/');
    }
  }, [status, router, error]);

  const getErrorMessage = (err: string) => {
    switch (err) {
      case 'NaoAutorizado':
        return 'Seu e-mail não está pré-autorizado. Entre em contato com seu orientador.';
      case 'AguardandoAutorizacao':
        return 'Sua conta está cadastrada, mas aguarda ativação pelo orientador.';
      case 'ErroInterno':
        return 'Ocorreu um erro no servidor. Tente novamente mais tarde.';
      case 'SessionRequired':
        return 'Sessão expirada. Por favor, faça login novamente.';
      default:
        return 'Falha na autenticação. Tente novamente.';
    }
  };

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailDev) return;
    setLoadingDev(true);
    await signIn('credentials', { email: emailDev, callbackUrl: '/' });
  };

  return (
    <div className="relative z-10 w-full max-w-md px-6 py-12 glass rounded-2xl shadow-2xl transition-all duration-300">
      {/* Logo e Cabeçalho */}
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
          <GraduationCap className="h-10 w-10 animate-pulse" />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            SOAI
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-2">
            Sistema de Orientação Acadêmica Inteligente
          </p>
        </div>
      </div>

      {/* Alertas de Erro */}
      {error && (
        <div className="flex items-start gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <h4 className="font-semibold text-red-400">Acesso Negado</h4>
            <p className="mt-0.5 text-slate-300">{getErrorMessage(error)}</p>
          </div>
        </div>
      )}

      {/* Ação de Login */}
      <div className="space-y-6">
        {/* Provedor Oficial: Google */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Acesso Oficial via SSO
          </label>
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            disabled={status === 'loading' || loadingDev}
            className="group relative flex w-full items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {/* Ícone Simplificado do Google */}
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>{status === 'loading' ? 'Conectando...' : 'Entrar com o Google'}</span>
            </div>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Divisor */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-900/60"></div>
          <span className="flex-shrink mx-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            Ambiente Local / Dev
          </span>
          <div className="flex-grow border-t border-slate-900/60"></div>
        </div>

        {/* Login de Desenvolvimento (Credentials) */}
        <form onSubmit={handleDevLogin} className="space-y-3.5">
          <div className="space-y-1.5">
            <label htmlFor="emailDev" className="text-xs font-semibold text-slate-400 block">
              E-mail de Teste Local
            </label>
            <input
              type="text"
              id="emailDev"
              required
              value={emailDev}
              onChange={(e) => setEmailDev(e.target.value)}
              placeholder="ex: orientador@teste.com"
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none placeholder:text-slate-650"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || loadingDev || !emailDev}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-slate-200 font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{loadingDev ? 'Autenticando...' : 'Entrar como Desenvolvedor'}</span>
          </button>

          <p className="text-[10px] text-slate-500 leading-normal text-center bg-slate-950/20 p-2.5 border border-slate-900/40 rounded-lg">
            Digite um e-mail contendo a palavra <strong className="text-indigo-400">orientador</strong> para painel do orientador, ou <strong className="text-indigo-400">aluno</strong> para painel do aluno.
          </p>
        </form>

        <p className="text-[10px] text-center text-slate-600 mt-6">
          Área de login restrita a alunos pré-autorizados e orientadores cadastrados no sistema.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 px-4">
      {/* Círculos de Fundo Estilo Blur */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <Suspense fallback={
        <div className="relative z-10 w-full max-w-md px-6 py-12 glass rounded-2xl text-center text-slate-400">
          Carregando portal de acesso...
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
