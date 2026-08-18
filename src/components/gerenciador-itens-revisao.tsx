'use client';

import React from 'react';
import { CheckSquare, Square, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { adicionarItemRevisao, alternarStatusItemRevisao } from '@/app/actions';

interface ItemRevisaoData {
  id: string;
  secaoId: string;
  localizacao: string;
  criterio: string;
  acaoRequerida: string;
  responsavel: string;
  status: string;
}

interface GerenciadorItensRevisaoProps {
  secaoId: string;
  itensInicial: ItemRevisaoData[];
  somenteLeitura?: boolean;
}

export function GerenciadorItensRevisao({ secaoId, itensInicial, somenteLeitura = false }: GerenciadorItensRevisaoProps) {
  const [itens, setItens] = React.useState<ItemRevisaoData[]>(itensInicial);
  const [localizacao, setLocalizacao] = React.useState('');
  const [criterio, setCriterio] = React.useState('');
  const [acaoRequerida, setAcaoRequerida] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState('');

  React.useEffect(() => {
    setItens(itensInicial);
  }, [itensInicial]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localizacao || !criterio || !acaoRequerida) return;
    setLoading(true);
    setErro('');

    try {
      const novoItem = await adicionarItemRevisao(secaoId, localizacao, criterio, acaoRequerida);
      setItens((prev) => [...prev, novoItem as any]);
      setLocalizacao('');
      setCriterio('');
      setAcaoRequerida('');
    } catch (err) {
      setErro('Erro ao adicionar item de correção.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (itemId: string, statusAtual: string) => {
    // Otimista
    const novoStatus = statusAtual === 'CONCLUIDO' ? 'PENDENTE' : 'CONCLUIDO';
    setItens((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: novoStatus } : item))
    );

    try {
      await alternarStatusItemRevisao(itemId, statusAtual);
    } catch (err) {
      // Reverter em caso de erro
      setItens(itensInicial);
    }
  };

  const pendentes = itens.filter(i => i.status !== 'CONCLUIDO');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900/50 pb-2">
        <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Ajustes Corretivos Pendentes ({pendentes.length})</h4>
        {loading && <RefreshCw className="h-3.5 w-3.5 text-indigo-400 animate-spin" />}
      </div>

      {erro && (
        <div className="flex items-center gap-1.5 p-2 bg-red-500/10 border border-red-500/20 text-red-200 text-[10px] rounded-lg">
          <AlertCircle className="h-3.5 w-3.5 text-red-400" />
          <span>{erro}</span>
        </div>
      )}

      {itens.length === 0 ? (
        <p className="text-[10px] text-slate-550 italic">Nenhum ajuste corretivo individual pendente.</p>
      ) : (
        <div className="space-y-2">
          {itens.map((item) => {
            const isConcluido = item.status === 'CONCLUIDO';
            return (
              <div 
                key={item.id} 
                className={`p-3 border rounded-xl flex items-start justify-between gap-3 text-xs transition-all ${
                  isConcluido 
                    ? 'border-slate-900 bg-slate-950/20 opacity-50' 
                    : 'border-slate-800/80 bg-slate-950/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded">
                      {item.localizacao}
                    </span>
                    <span className="text-[9px] font-medium text-slate-500">Resp: {item.responsavel}</span>
                  </div>
                  <p className={`font-semibold ${isConcluido ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {item.criterio}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono leading-normal">
                    👉 Ação: {item.acaoRequerida}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleItem(item.id, item.status)}
                  className="text-slate-500 hover:text-indigo-400 cursor-pointer p-0.5 shrink-0"
                >
                  {isConcluido ? (
                    <CheckSquare className="h-4.5 w-4.5 text-emerald-450" />
                  ) : (
                    <Square className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Formulário de Adicionar Item (apenas para o Orientador) */}
      {!somenteLeitura && (
        <form onSubmit={handleAddItem} className="space-y-2 pt-3 border-t border-slate-900/60">
          <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wide block">Adicionar Novo Ajuste Corretivo</span>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input 
              type="text" 
              required
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
              placeholder="Local (ex: Cap. 2, pág 4)"
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-[10px] outline-none"
            />
            <input 
              type="text" 
              required
              value={criterio}
              onChange={(e) => setCriterio(e.target.value)}
              placeholder="Critério (ex: Citação incorreta)"
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-[10px] outline-none md:col-span-2"
            />
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              required
              value={acaoRequerida}
              onChange={(e) => setAcaoRequerida(e.target.value)}
              placeholder="Ação Requerida (ex: Substituir autor X por autor Y e ajustar ABNT)"
              className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-[10px] outline-none"
            />
            <button 
              type="submit" 
              disabled={loading || !localizacao || !criterio}
              className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg cursor-pointer transition-colors flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
