'use client';

import React, { useState } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { marcarNotificacaoLida } from '@/app/actions';

interface NotificacaoItem {
  id: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  createdAt: Date;
}

interface NotificationBellProps {
  notificacoesIniciais: NotificacaoItem[];
}

export function NotificationBell({ notificacoesIniciais }: NotificationBellProps) {
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>(notificacoesIniciais);
  const [isOpen, setIsOpen] = useState(false);

  const naoLidas = notificacoes.filter(n => !n.lida);

  const handleMarcarLida = async (id: string) => {
    // Atualizar UI instantaneamente (otimista)
    setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    await marcarNotificacaoLida(id);
  };

  const handleMarcarTodasLidas = async () => {
    // Atualizar todas
    const idsNaoLidas = naoLidas.map(n => n.id);
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    for (const id of idsNaoLidas) {
      await marcarNotificacaoLida(id);
    }
  };

  return (
    <div className="relative z-50">
      {/* Botão de Sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-slate-900/60 hover:bg-slate-900 border border-slate-900/50 hover:border-slate-800 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-200"
      >
        <Bell className="h-5 w-5" />
        {naoLidas.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-extrabold text-white animate-pulse">
            {naoLidas.length}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 cursor-default" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2.5 w-80 bg-slate-950/95 border border-slate-900 rounded-2xl shadow-xl shadow-black/80 backdrop-blur-md z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <h4 className="font-bold text-sm text-slate-200">Notificações</h4>
              {naoLidas.length > 0 && (
                <button
                  onClick={handleMarcarTodasLidas}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                >
                  Limpar todas
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {notificacoes.length === 0 ? (
                <p className="text-xs text-slate-550 text-center py-6">Você está em dia com todas as atividades.</p>
              ) : (
                notificacoes.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => !item.lida && handleMarcarLida(item.id)}
                    className={`p-3 rounded-xl border transition-all text-left flex flex-col space-y-1 relative group ${
                      item.lida
                        ? 'bg-slate-950/20 border-slate-950 text-slate-500'
                        : 'bg-slate-900/40 border-slate-900/80 hover:border-slate-800 text-slate-200 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`font-bold text-xs ${item.lida ? 'text-slate-500' : 'text-slate-250'}`}>
                        {item.titulo}
                      </span>
                      {!item.lida && (
                        <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-400">{item.mensagem}</p>
                    <div className="flex items-center gap-1 text-[9px] text-slate-550">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
