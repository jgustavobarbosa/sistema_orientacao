'use client';

import React, { Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, BookOpen, Calendar, ShieldCheck, Cpu } from 'lucide-react';
import Link from 'next/link';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const error = searchParams.get('error');

  const [email, setEmail] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [erroLocal, setErroLocal] = React.useState('');

  React.useEffect(() => {
    if (status === 'authenticated' && !error) {
      router.push('/');
    }
  }, [status, router, error]);

  const getErrorMessage = (err: string) => {
    switch (err) {
      case 'NaoAutorizado':
        return 'Seu e-mail não está cadastrado ou autorizado. Registre-se primeiro.';
      case 'AguardandoAutorizacao':
        return 'Sua conta ainda não está ativa. Um orientador ou administrador precisa aprovar e vincular seu cadastro a um projeto.';
      case 'EmailNaoConfirmado':
        return 'Por favor, confirme seu e-mail através do link enviado para sua caixa de entrada para poder acessar a plataforma.';
      case 'ErroInterno':
        return 'Ocorreu um erro no servidor. Tente novamente mais tarde.';
      case 'CredentialsSignin':
        return 'E-mail ou senha incorretos. Verifique suas credenciais.';
      default:
        return 'Falha na autenticação. Tente novamente.';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) return;
    setLoading(true);
    setErroLocal('');

    try {
      const res = await signIn('credentials', {
        email,
        senha,
        redirect: false,
      });

      if (res?.error) {
        // Tratar erro do NextAuth
        if (res.url && res.url.includes('error=')) {
          const urlParams = new URLSearchParams(res.url.split('?')[1]);
          const errCode = urlParams.get('error');
          setErroLocal(getErrorMessage(errCode || ''));
        } else {
          setErroLocal(getErrorMessage(res.error));
        }
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      setErroLocal('Ocorreu um erro ao tentar efetuar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
      
      {/* Coluna Esquerda: Apresentação / Landing Page */}
      <div className="lg:col-span-7 space-y-8 text-left animate-slide-left">
        <div className="space-y-5">
          {/* Logo Oficial do Kit de Identidade em SVG */}
          <div className="flex items-center gap-3">
            <img 
              src="/kit-identidade/soia-logo-dark.svg" 
              alt="SOIA Logo" 
              className="h-10 object-contain min-h-[32px]"
            />
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight pt-2">
            Gestão científica inteligente em <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">um só espaço.</span>
          </h1>
          
          <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
            O SOIA centraliza a comunicação entre orientador e orientando, unificando cronogramas, redação científica, atas estruturadas e auditoria autônoma de escrita por inteligência artificial.
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
      <div className="lg:col-span-5 flex justify-center animate-slide-right">
        <div className="w-full max-w-md px-6 py-10 glass rounded-3xl shadow-2xl relative">
          
          <div className="flex flex-col items-center text-center space-y-4 mb-6">
            <img 
              src="/kit-identidade/soia-app-icon.svg" 
              alt="SOIA App Icon" 
              className="h-12 w-12 object-contain"
            />
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-100">
                Acessar Plataforma
              </h2>
              <p className="text-[10px] text-slate-400 mt-1">
                SOIA — Sistema de Orientação Inteligente Avançado
              </p>
            </div>
          </div>

          {/* Alertas de Erro (URL ou Local) */}
          {(error || erroLocal) && (
            <div className="flex items-start gap-3 p-4 mb-5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs animate-in fade-in slide-in-from-top-4 duration-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <div>
                <h4 className="font-semibold text-red-400">Acesso Restrito</h4>
                <p className="mt-0.5 text-slate-350">{erroLocal || getErrorMessage(error || '')}</p>
              </div>
            </div>
          )}

          {/* Form de Acesso Email/Senha */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="ex: aluno@universidade.edu.br"
                className="w-full px-4 py-3 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label htmlFor="senha" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Senha
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <input
                type="password"
                id="senha"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha de acesso"
                className="w-full px-4 py-3 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none placeholder:text-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !senha}
              className="group relative flex w-full items-center justify-between gap-3 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all duration-300 shadow-md shadow-blue-600/10 hover:shadow-blue-600/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <span>{loading ? 'Acessando...' : 'Entrar na Plataforma'}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Links Adicionais de Cadastro */}
            <div className="pt-4 border-t border-slate-900/60 text-center">
              <p className="text-xs text-slate-500">
                Ainda não tem uma conta?{' '}
                <Link 
                  href="/register" 
                  className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
                >
                  Registre-se
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [showIntro, setShowIntro] = React.useState(false);
  const [introDone, setIntroDone] = React.useState(false);

  React.useEffect(() => {
    const alreadySeen = sessionStorage.getItem('soia-intro-seen');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!alreadySeen && !prefersReducedMotion) {
      setShowIntro(true);
      const timer = setTimeout(() => {
        handleCloseIntro();
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseIntro = () => {
    setIntroDone(true);
    sessionStorage.setItem('soia-intro-seen', '1');
    setTimeout(() => {
      setShowIntro(false);
    }, 550);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent px-6 py-12">
      {/* Abertura SOIA */}
      {showIntro && (
        <section className={`soia-intro ${introDone ? 'done' : ''}`} aria-label="Apresentação SOIA">
          <div className="soia-brand">
            <svg className="soia-mark" viewBox="0 0 256 256" aria-hidden="true">
              <path className="route upper" d="M202 42H112C65 42 42 70 42 101c0 25 17 43 42 47" stroke="#2563EB" strokeWidth="24"/>
              <path className="route lower" d="M54 214h90c47 0 70-28 70-59 0-25-17-43-42-47" stroke="#2563EB" strokeWidth="24"/>
              <path className="orbit" d="M89 113a48 48 0 0 1 70-25" stroke="#06B6D4" strokeWidth="16"/>
              <path className="orbit" d="M167 143a48 48 0 0 1-70 25" stroke="#06B6D4" strokeWidth="16"/>
              <circle className="core" cx="128" cy="128" r="24" fill="#2563EB"/>
              <circle className="node a" cx="202" cy="42" r="10" fill="#06B6D4"/>
              <circle className="node b" cx="54" cy="214" r="10" fill="#06B6D4"/>
            </svg>
            <div className="wording">
              <div className="wordmark-intro">SOIA</div>
              <div className="tagline-intro">SISTEMA DE ORIENTAÇÃO INTELIGENTE AVANÇADO</div>
            </div>
          </div>
          <button className="skip" type="button" onClick={handleCloseIntro}>Pular abertura</button>
        </section>
      )}

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

      {/* Gradiente Overlay para misturar com a marca e fundos */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#030712]/40 via-transparent to-[#030712]/95 z-0 pointer-events-none" />

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
