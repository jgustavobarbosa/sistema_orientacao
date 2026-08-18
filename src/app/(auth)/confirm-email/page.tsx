'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = React.useState<'processando' | 'sucesso' | 'erro'>('processando');
  const [mensagemErro, setMensagemErro] = React.useState('');

  React.useEffect(() => {
    if (token) {
      confirmarEmailReal();
    } else {
      setStatus('erro');
      setMensagemErro('Parâmetro de ativação inválido na URL.');
    }
  }, [token]);

  const confirmarEmailReal = async () => {
    try {
      const res = await fetch('/api/auth/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        setStatus('sucesso');
      } else {
        const text = await res.text();
        setStatus('erro');
        setMensagemErro(text || 'Falha ao validar o token de confirmação.');
      }
    } catch (err) {
      setStatus('erro');
      setMensagemErro('Erro na comunicação com o servidor.');
    }
  };

  if (status === 'processando') {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-sm font-bold text-slate-200">Confirmando seu E-mail</h3>
        <p className="text-xs text-slate-400">
          Por favor, aguarde enquanto validamos suas informações com o servidor...
        </p>
      </div>
    );
  }

  if (status === 'erro') {
    return (
      <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
        <AlertCircle className="h-14 w-14 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">Falha na Confirmação</h3>
        <p className="text-xs text-slate-450 leading-relaxed max-w-xs mx-auto">
          {mensagemErro}
        </p>
        <div className="pt-2">
          <Link 
            href="/register" 
            className="inline-block py-2 px-4 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-850"
          >
            Tentar Registrar Novamente
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
      <CheckCircle2 className="h-14 w-14 text-emerald-450 mx-auto" />
      <h3 className="text-lg font-bold text-slate-200">E-mail Confirmado!</h3>
      <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
        Parabéns! Seu endereço de e-mail foi validado. 
        Sua conta agora aguarda vinculação e liberação por um orientador para acesso completo.
      </p>
      <div className="pt-2">
        <Link 
          href="/login" 
          className="inline-block py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all duration-300"
        >
          Ir para o Login
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
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

      {/* Box de Confirmação */}
      <div className="relative z-10 w-full max-w-md px-6 py-10 glass rounded-3xl shadow-2xl animate-slide-right">
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <img 
            src="/kit-identidade/soia-app-icon.svg" 
            alt="SOIA App Icon" 
            className="h-12 w-12 object-contain"
          />
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-100">
              Confirmação de E-mail
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              Validação de segurança acadêmica SOIA
            </p>
          </div>
        </div>

        <Suspense fallback={
          <div className="text-center text-slate-400 text-xs py-8">
            Carregando página de confirmação...
          </div>
        }>
          <ConfirmEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
