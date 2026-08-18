'use client';

import React, { Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GraduationCap, AlertCircle, ArrowRight, BookOpen, Calendar, ShieldCheck, Cpu } from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const error = searchParams.get('error');

  const [emailDev, setEmailDev] = React.useState('');
  const [loadingDev, setLoadingDev] = React.useState(false);

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
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
      
      {/* Coluna Esquerda: Apresentação / Landing Page */}
      <div className="lg:col-span-7 space-y-8 text-left animate-in slide-in-from-left duration-500">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-blue-500/10 border border-blue-500/25 rounded-2xl text-blue-400">
            <GraduationCap className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Portal Acadêmico SOAI</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Gestão científica inteligente em <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">um só espaço.</span>
          </h1>
          
          <p className="text-base text-slate-400 leading-relaxed max-w-xl">
            O SOAI centraliza a comunicação entre orientador e orientando, unificando cronogramas, redação científica, atas estruturadas e auditoria autônoma de escrita por inteligência artificial.
          </p>
        </div>

        {/* Grade de Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-4 items-start group">
            <div className="p-2.5 bg-slate-900 border border-slate-800 text-blue-400 rounded-xl group-hover:border-blue-500/30 transition-all duration-300">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Agenda Inteligente</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Agendamento de encontros informais ou rotinas periódicas sem choques de horário, integrado a e-mails e Google Meet fixo por aluno.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start group">
            <div className="p-2.5 bg-slate-900 border border-slate-800 text-blue-400 rounded-xl group-hover:border-blue-500/30 transition-all duration-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Redação & Versões</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Submissão organizada de capítulos, revisão comentada do orientador, reescrita interativa e dossiê final de trechos validados.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start group">
            <div className="p-2.5 bg-slate-900 border border-slate-800 text-blue-400 rounded-xl group-hover:border-blue-500/30 transition-all duration-300">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Auditoria e Auxílio IA</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Triagem diagnóstica Gemini de documentos acadêmicos e auditoria avançada que calcula score e identifica textos gerados por inteligência artificial.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start group">
            <div className="p-2.5 bg-slate-900 border border-slate-800 text-blue-400 rounded-xl group-hover:border-blue-500/30 transition-all duration-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Segurança & Conformidade</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Isolamento estrito multi-aluno garantindo confidencialidade absoluta de atas, avaliações e relatórios individuais.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coluna Direita: Box de Acesso / Login */}
      <div className="lg:col-span-5 flex justify-center animate-in slide-in-from-right duration-500">
        <div className="w-full max-w-md px-6 py-10 glass rounded-3xl shadow-2xl relative">
          
          <div className="flex flex-col items-center text-center space-y-4 mb-6">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">
                Acessar Plataforma
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Conecte-se para gerenciar ou visualizar orientações
              </p>
            </div>
          </div>

          {/* Alertas de Erro */}
          {error && (
            <div className="flex items-start gap-3 p-4 mb-5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs animate-in fade-in slide-in-from-top-4 duration-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <div>
                <h4 className="font-semibold text-red-400">Acesso Negado</h4>
                <p className="mt-0.5 text-slate-350">{getErrorMessage(error)}</p>
              </div>
            </div>
          )}

          {/* Ação de Login */}
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                SSO Universitário
              </label>
              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                disabled={status === 'loading' || loadingDev}
                className="group relative flex w-full items-center justify-between gap-3 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all duration-300 shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>{status === 'loading' ? 'Conectando...' : 'Entrar com o Google'}</span>
                </div>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Divisor */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-900"></div>
              <span className="flex-shrink mx-3 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                Desenvolvedor / Teste
              </span>
              <div className="flex-grow border-t border-slate-900"></div>
            </div>

            {/* Login de Desenvolvimento */}
            <form onSubmit={handleDevLogin} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="emailDev" className="text-[10px] font-semibold text-slate-400 block">
                  E-mail Acadêmico Simulado
                </label>
                <input
                  type="text"
                  id="emailDev"
                  required
                  value={emailDev}
                  onChange={(e) => setEmailDev(e.target.value)}
                  placeholder="ex: orientador@teste.com"
                  className="w-full px-4 py-2 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none placeholder:text-slate-700"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading' || loadingDev || !emailDev}
                className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-bold text-xs rounded-xl transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{loadingDev ? 'Acessando...' : 'Autenticar Rápido'}</span>
              </button>

              <p className="text-[9px] text-slate-500 leading-normal text-center bg-slate-950/40 p-2.5 border border-slate-900/60 rounded-xl">
                Contendo <strong className="text-blue-400 font-semibold">orientador</strong> vai para o painel do professor, ou <strong className="text-blue-400 font-semibold">aluno</strong> para o painel de orientandos.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent px-6 py-12">
      {/* Efeitos de Blur Azul Premium */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Suspense fallback={
        <div className="relative z-10 w-full max-w-md px-6 py-12 glass rounded-2xl text-center text-slate-400 text-sm">
          Carregando portal acadêmico...
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
