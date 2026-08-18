'use client';

import React from 'react';
import { Send, Sparkles, BookOpen, AlertCircle, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SecaoData {
  id: string;
  titulo: string;
  conteudo: string;
  status: string;
  versao: number;
  obrigatoria: boolean;
  instrucaoPrompt: string | null;
  criteriosAceite: string | null;
  oQueProduzi: string | null;
  oQueMudou: string | null;
  ondeTenhoDuvida: string | null;
  oQuePrecisoAvancar: string | null;
}

interface FormRedacaoAlunoProps {
  projetoId: string;
  secoes: SecaoData[];
}

export function FormRedacaoAluno({ projetoId, secoes }: FormRedacaoAlunoProps) {
  const router = useRouter();
  
  // Inicializar com a primeira seção da lista se houver
  const [secaoId, setSecaoId] = React.useState(secoes[0]?.id || '');
  const [conteudo, setConteudo] = React.useState('');
  const [oQueProduzi, setOQueProduzi] = React.useState('');
  const [oQueMudou, setOQueMudou] = React.useState('');
  const [ondeTenhoDuvida, setOndeTenhoDuvida] = React.useState('');
  const [oQuePrecisoAvancar, setOQuePrecisoAvancar] = React.useState('');

  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState('');
  const [sucesso, setSucesso] = React.useState('');

  // Achar a seção atualmente selecionada
  const secaoAtiva = secoes.find(s => s.id === secaoId);

  // Efeito para carregar o conteúdo da seção selecionada no editor
  React.useEffect(() => {
    if (secaoAtiva) {
      setConteudo(secaoAtiva.conteudo || '');
      setOQueProduzi(secaoAtiva.oQueProduzi || '');
      setOQueMudou(secaoAtiva.oQueMudou || '');
      setOndeTenhoDuvida(secaoAtiva.ondeTenhoDuvida || '');
      setOQuePrecisoAvancar(secaoAtiva.oQuePrecisoAvancar || '');
      setErro('');
      setSucesso('');
    }
  }, [secaoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secaoId || !conteudo.trim()) return;
    setLoading(true);
    setErro('');
    setSucesso('');

    try {
      const res = await fetch('/api/aluno/submeter-secao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projetoId,
          secaoId,
          titulo: secaoAtiva?.titulo,
          conteudo,
          oQueProduzi,
          oQueMudou,
          ondeTenhoDuvida,
          oQuePrecisoAvancar
        }),
      });

      if (res.ok) {
        setSucesso('Capítulo submetido com sucesso para avaliação!');
        router.refresh();
      } else {
        const text = await res.text();
        setErro(text || 'Falha ao submeter o capítulo.');
      }
    } catch (err) {
      setErro('Erro na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
          <Send className="h-5 w-5" />
        </div>
        <h3 className="font-bold text-slate-200">Submeter Capítulo</h3>
      </div>

      {erro && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <p>{erro}</p>
        </div>
      )}

      {sucesso && (
        <div className="flex items-start gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs rounded-xl animate-pulse">
          <BookOpen className="h-4 w-4 shrink-0 text-emerald-400" />
          <p>{sucesso}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Seletor de Seções da Grade do Aluno */}
        <div className="space-y-1.5">
          <label htmlFor="secaoSelect" className="text-xs font-semibold text-slate-400">
            Escolher Seção do Modelo
          </label>
          <select
            id="secaoSelect"
            value={secaoId}
            onChange={(e) => setSecaoId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs outline-none"
          >
            {secoes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.titulo} {s.obrigatoria ? '*' : ''} ({s.status})
              </option>
            ))}
          </select>
        </div>

        {/* Caixa de Prompt/Diretrizes e Critérios do Catálogo */}
        {secaoAtiva && (secaoAtiva.instrucaoPrompt || secaoAtiva.criteriosAceite) && (
          <div className="p-3.5 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-2 text-[11px] leading-relaxed">
            {secaoAtiva.instrucaoPrompt && (
              <div>
                <span className="font-bold text-indigo-400 uppercase tracking-wider block text-[9px]">💡 Diretriz de Escrita:</span>
                <p className="text-slate-350 mt-0.5">{secaoAtiva.instrucaoPrompt}</p>
              </div>
            )}
            {secaoAtiva.criteriosAceite && (
              <div className="pt-1.5 border-t border-indigo-950/50">
                <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[9px]">✔ Critério de Aceite:</span>
                <p className="text-slate-350 mt-0.5">{secaoAtiva.criteriosAceite}</p>
              </div>
            )}
          </div>
        )}

        {/* Editor de Texto Científico */}
        <div className="space-y-1.5">
          <label htmlFor="conteudo" className="text-xs font-semibold text-slate-400">
            Conteúdo do Capítulo (Texto Completo)
          </label>
          <textarea
            id="conteudo"
            required
            rows={12}
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Escreva ou cole aqui a redação completa desta seção para que o orientador faça as correções..."
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-xs placeholder-slate-650 outline-none resize-none font-mono leading-relaxed"
          />
        </div>

        {/* Protocolo de 4 blocos */}
        <div className="border-t border-slate-900/40 pt-4 space-y-3">
          <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Protocolo de Submissão</h4>
          
          <div className="space-y-1">
            <label htmlFor="oQueProduzi" className="text-[10px] text-slate-400 block font-semibold">1. O que produzi nesta versão?</label>
            <input
              type="text"
              id="oQueProduzi"
              required
              value={oQueProduzi}
              onChange={(e) => setOQueProduzi(e.target.value)}
              placeholder="ex: Redigi os parágrafos sobre delimitação espacial..."
              className="w-full px-3 py-2 bg-slate-950/40 border border-slate-900 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none placeholder:text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="oQueMudou" className="text-[10px] text-slate-400 block font-semibold">2. O que mudou em relação à versão anterior?</label>
            <input
              type="text"
              id="oQueMudou"
              value={oQueMudou}
              onChange={(e) => setOQueMudou(e.target.value)}
              placeholder="ex: Ajustei a hipótese C baseado no feedback..."
              className="w-full px-3 py-2 bg-slate-950/40 border border-slate-900 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none placeholder:text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="ondeTenhoDuvida" className="text-[10px] text-slate-400 block font-semibold">3. Onde tenho dúvida ou gargalo?</label>
            <input
              type="text"
              id="ondeTenhoDuvida"
              value={ondeTenhoDuvida}
              onChange={(e) => setOndeTenhoDuvida(e.target.value)}
              placeholder="ex: Profundidade da revisão sistemática..."
              className="w-full px-3 py-2 bg-slate-950/40 border border-slate-900 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none placeholder:text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="oQuePrecisoAvancar" className="text-[10px] text-slate-400 block font-semibold">4. O que preciso para avançar?</label>
            <input
              type="text"
              id="oQuePrecisoAvancar"
              value={oQuePrecisoAvancar}
              onChange={(e) => setOQuePrecisoAvancar(e.target.value)}
              placeholder="ex: Feedback metodológico..."
              className="w-full px-3 py-2 bg-slate-950/40 border border-slate-900 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none placeholder:text-slate-800"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !conteudo || !oQueProduzi}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all duration-200 shadow-md shadow-indigo-650/10 cursor-pointer disabled:opacity-40"
        >
          {loading ? 'Submetendo...' : 'Enviar para Avaliação'}
        </button>
      </form>
    </div>
  );
}
