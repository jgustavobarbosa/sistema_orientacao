'use client';

import React from 'react';
import { decidirStageGate } from '@/app/actions';

interface FormDecisaoGateProps {
  etapaProjetoId: string;
}

export function FormDecisaoGate({ etapaProjetoId }: FormDecisaoGateProps) {
  const [parecer, setParecer] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parecer.trim()) return;
    setLoading(true);
    setErro('');

    try {
      await decidirStageGate(etapaProjetoId, 'APROVADO', parecer);
      // Recarregar a página para atualizar o status e a timeline
      window.location.reload();
    } catch (err: any) {
      setErro(err.message || 'Erro ao aprovar o gate da etapa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {erro && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl font-medium">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <input 
          type="text" 
          required
          value={parecer}
          onChange={(e) => setParecer(e.target.value)}
          placeholder="Adicione um parecer descritivo do gate científico..."
          className="flex-1 px-3 py-2 bg-slate-950/50 border border-slate-900 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none"
        />
        <button 
          type="submit"
          disabled={loading || !parecer}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer whitespace-nowrap transition-colors disabled:opacity-50"
        >
          {loading ? 'Processando...' : 'Fechar Gate e Avançar'}
        </button>
      </form>
    </div>
  );
}
