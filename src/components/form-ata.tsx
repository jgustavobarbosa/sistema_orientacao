'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle, 
  Calendar, 
  HelpCircle,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface AlunoOption {
  id: string;
  nome: string;
}

interface FormAtaProps {
  projetoId: string;
  alunos: AlunoOption[];
  numeroSugerido: number;
  perguntaPesquisaSugerida: string;
  onSubmitAction: (data: any) => Promise<{ success: boolean; error?: string; reuniaoId?: string }>;
}

export function FormAta({ 
  projetoId, 
  alunos, 
  numeroSugerido, 
  perguntaPesquisaSugerida,
  onSubmitAction 
}: FormAtaProps) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingIA, setLoadingIA] = useState(false);
  const [iaFeedback, setIaFeedback] = useState<string | null>(null);

  const preencherComIA = async () => {
    setLoadingIA(true);
    setIaFeedback(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/projetos/${projetoId}/ultimo-parecer`);
      const data = await res.json();
      
      if (data.sucesso) {
        // Preencher Produto em Desenvolvimento e Versão do Material
        setProdutoEmDesenvolvimento(`Revisão de: ${data.tituloDocumento}`);
        setVersaoMaterial(`v${data.versao}`);
        
        // Preencher Síntese do Avanço
        setSintese([
          { 
            entrega: `Revisar manuscrito: ${data.tituloDocumento}`, 
            situacao: 'Revisar', 
            link: `Drive File ID: ${data.tituloDocumento}`, 
            observacao: `Resumo LLM: ${data.resumo.substring(0, 100)}...`
          }
        ]);

        // Preencher Decisões Tomadas
        setDecisoes([
          { 
            decisao: `Realizar os ajustes de escrita apontados no parecer do Gemini`, 
            justificativa: `Melhorar a clareza e solidez metodológica da pesquisa`, 
            impacto: `Avanço na qualidade do trabalho final`, 
            responsavel: 'Orientando' 
          }
        ]);

        // Preencher Riscos
        setRiscos([
          { 
            dimensao: 'Metodológica', 
            situacao: `Lacunas encontradas: ${data.lacunas.substring(0, 80)}...`, 
            nivelRisco: 'MEDIO', 
            mitigacao: `Refinar as seções apontadas seguindo as orientações da IA`, 
            revisao: new Date().toISOString().substring(0, 10) 
          }
        ]);

        setIaFeedback(`Ata pré-preenchida com sucesso a partir do manuscrito: "${data.tituloDocumento}"!`);
      } else {
        setErrorMsg(data.mensagem || 'Nenhum documento com parecer LLM ativo encontrado para este projeto.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Falha ao obter parecer do Gemini para preenchimento.');
    } finally {
      setLoadingIA(false);
    }
  };

  // --- SEÇÃO 1: Cabeçalho ---
  const [numeroEncontro, setNumeroEncontro] = useState(numeroSugerido);
  const [dataHoraInicio, setDataHoraInicio] = useState(new Date().toISOString().substring(0, 16));
  const [versaoMaterial, setVersaoMaterial] = useState('');
  const [participantes, setParticipantes] = useState<string[]>(['Orientador']);
  const [perguntaVigente, setPerguntaVigente] = useState(perguntaPesquisaSugerida);
  const [produtoEmDesenvolvimento, setProdutoEmDesenvolvimento] = useState('');
  const [situacaoCronograma, setSituacaoCronograma] = useState('VERDE'); // VERDE | AMARELO | VERMELHO

  // --- SEÇÃO 2: Síntese do Avanço ---
  const [sintese, setSintese] = useState([
    { entrega: '', situacao: 'Entregue', link: '', observacao: '' }
  ]);

  const addSinteseRow = () => {
    setSintese([...sintese, { entrega: '', situacao: 'Entregue', link: '', observacao: '' }]);
  };

  const removeSinteseRow = (index: number) => {
    setSintese(sintese.filter((_, i) => i !== index));
  };

  const updateSintese = (index: number, field: string, value: string) => {
    const updated = [...sintese];
    updated[index] = { ...updated[index], [field]: value };
    setSintese(updated);
  };

  // --- SEÇÃO 3: Decisões Tomadas ---
  const [decisoes, setDecisoes] = useState([
    { decisao: '', justificativa: '', impacto: '', responsavel: 'Ambos' }
  ]);

  const addDecisaoRow = () => {
    setDecisoes([...decisoes, { decisao: '', justificativa: '', impacto: '', responsavel: 'Ambos' }]);
  };

  const removeDecisaoRow = (index: number) => {
    setDecisoes(decisoes.filter((_, i) => i !== index));
  };

  const updateDecisao = (index: number, field: string, value: string) => {
    const updated = [...decisoes];
    updated[index] = { ...updated[index], [field]: value };
    setDecisoes(updated);
  };

  // --- SEÇÃO 4: Questões Críticas e Riscos ---
  const [riscos, setRiscos] = useState([
    { dimensao: 'Metodológica', situacao: '', nivelRisco: 'BAIXO', mitigacao: '', revisao: new Date().toISOString().substring(0, 10) }
  ]);

  const addRiscoRow = () => {
    setRiscos([...riscos, { dimensao: 'Metodológica', situacao: '', nivelRisco: 'BAIXO', mitigacao: '', revisao: new Date().toISOString().substring(0, 10) }]);
  };

  const removeRiscoRow = (index: number) => {
    setRiscos(riscos.filter((_, i) => i !== index));
  };

  const updateRisco = (index: number, field: string, value: string) => {
    const updated = [...riscos];
    updated[index] = { ...updated[index], [field]: value };
    setRiscos(updated);
  };

  // --- SEÇÃO 5: Plano de Trabalho ---
  const [plano, setPlano] = useState([
    { tarefa: '', produto: '', responsavelId: alunos[0]?.id || '', prazo: new Date().toISOString().substring(0, 10), status: 'A_FAZER' }
  ]);

  const addPlanoRow = () => {
    setPlano([...plano, { tarefa: '', produto: '', responsavelId: alunos[0]?.id || '', prazo: new Date().toISOString().substring(0, 10), status: 'A_FAZER' }]);
  };

  const removePlanoRow = (index: number) => {
    setPlano(plano.filter((_, i) => i !== index));
  };

  const updatePlano = (index: number, field: string, value: string) => {
    const updated = [...plano];
    updated[index] = { ...updated[index], [field]: value };
    setPlano(updated);
  };

  // --- SEÇÃO 6: Perguntas Norteadoras ---
  const [perguntas, setPerguntas] = useState<string[]>(['']);

  const addPergunta = () => setPerguntas([...perguntas, '']);
  const removePergunta = (index: number) => setPerguntas(perguntas.filter((_, i) => i !== index));
  const updatePergunta = (index: number, value: string) => {
    const updated = [...perguntas];
    updated[index] = value;
    setPerguntas(updated);
  };

  // --- SEÇÃO 7: Próximo Encontro ---
  const [proximaData, setProximaData] = useState('');
  const [materialPrevio, setMaterialPrevio] = useState('');
  const [destravamento1, setDestravamento1] = useState('');
  const [destravamento2, setDestravamento2] = useState('');
  const [destravamento3, setDestravamento3] = useState('');
  const [criterioAdequado, setCriterioAdequado] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const payload = {
      projetoId,
      numeroEncontro,
      dataHoraInicio: new Date(dataHoraInicio),
      versaoMaterial,
      participantes,
      perguntaVigente,
      produtoEmDesenvolvimento,
      situacaoCronograma,
      sinteseAvanco: sintese,
      decisoes,
      riscos,
      planoTrabalho: plano,
      perguntasProximaEntrega: perguntas.filter(p => p.trim() !== ''),
      proximoEncontro: {
        dataHora: proximaData ? new Date(proximaData) : null,
        materialPrevio,
        destravamentos: [destravamento1, destravamento2, destravamento3].filter(d => d.trim() !== ''),
        criterioAdequado
      }
    };

    try {
      const res = await onSubmitAction(payload);
      if (res.success) {
        router.push(`/orientador`);
      } else {
        setErrorMsg(res.error || 'Erro desconhecido ao salvar ata.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro de rede ao salvar ata.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-16 animate-in fade-in duration-300">
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SEÇÃO ASSISTIDA POR IA */}
      <div className="glass p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-950 via-indigo-950/10 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg shadow-indigo-500/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-md">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="font-bold text-slate-200">Preenchimento Assistido</h3>
          </div>
          <p className="text-xs text-slate-400">
            Pré-preencha avanço, decisões e riscos a partir da última análise do Gemini realizada para o manuscrito deste aluno.
          </p>
          {iaFeedback && (
            <p className="text-xs text-emerald-400 font-semibold animate-pulse mt-1">
              {iaFeedback}
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={loadingIA}
          onClick={preencherComIA}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/10 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <Sparkles className="h-4 w-4 animate-pulse" />
          {loadingIA ? 'Analisando parecer...' : 'Preencher com IA'}
        </button>
      </div>

      {/* 1. CABEÇALHO */}
      <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-6">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <span className="text-indigo-400 font-mono">01.</span> Cabeçalho do Encontro
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Encontro Nº</label>
            <input
              type="number"
              required
              value={numeroEncontro}
              onChange={(e) => setNumeroEncontro(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Data e Horário de Início</label>
            <input
              type="datetime-local"
              required
              value={dataHoraInicio}
              onChange={(e) => setDataHoraInicio(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Versão do Material Analisado</label>
            <input
              type="text"
              placeholder="Ex: v1.2, TCC_Cap1_v2"
              value={versaoMaterial}
              onChange={(e) => setVersaoMaterial(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Pergunta de Pesquisa Vigente</label>
            <input
              type="text"
              required
              value={perguntaVigente}
              onChange={(e) => setPerguntaVigente(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Produto em Desenvolvimento</label>
            <input
              type="text"
              placeholder="Ex: Artigo de conferência, Capítulo de introdução"
              value={produtoEmDesenvolvimento}
              onChange={(e) => setProdutoEmDesenvolvimento(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Situação do Cronograma</label>
            <select
              value={situacaoCronograma}
              onChange={(e) => setSituacaoCronograma(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            >
              <option value="VERDE">🟢 Verde (Em dia)</option>
              <option value="AMARELO">🟡 Amarelo (Atenção / Risco leve)</option>
              <option value="VERMELHO">🔴 Vermelho (Crítico / Atraso grave)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Participantes (Nomes)</label>
            <input
              type="text"
              placeholder="Orientador, Aluno (separados por vírgula)"
              value={participantes.join(', ')}
              onChange={(e) => setParticipantes(e.target.value.split(',').map(s => s.trim()))}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. SÍNTESE DO AVANÇO */}
      <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-900/60 pb-4">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <span className="text-indigo-400 font-mono">02.</span> Síntese do Avanço desde o Encontro Anterior
          </h2>
          <button
            type="button"
            onClick={addSinteseRow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="text-slate-400 text-xs font-semibold uppercase border-b border-slate-900/60">
                <th className="pb-3 w-[30%]">Entrega Prevista</th>
                <th className="pb-3 w-[20%]">Situação</th>
                <th className="pb-3 w-[25%]">Evidência / Link</th>
                <th className="pb-3 w-[20%]">Observação</th>
                <th className="pb-3 text-right w-[5%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40">
              {sintese.map((row, idx) => (
                <tr key={idx} className="group">
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Escrita da seção de metodologia"
                      value={row.entrega}
                      onChange={(e) => updateSintese(idx, 'entrega', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={row.situacao}
                      onChange={(e) => updateSintese(idx, 'situacao', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    >
                      <option value="Entregue">Entregue</option>
                      <option value="Parcialmente entregue">Parcialmente entregue</option>
                      <option value="Não entregue">Não entregue</option>
                      <option value="Atrasado">Atrasado</option>
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      placeholder="Link do Google Docs / Drive"
                      value={row.link}
                      onChange={(e) => updateSintese(idx, 'link', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      placeholder="Comentários sobre a entrega"
                      value={row.observacao}
                      onChange={(e) => updateSintese(idx, 'observacao', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      disabled={sintese.length === 1}
                      onClick={() => removeSinteseRow(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. DECISÕES TOMADAS */}
      <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-900/60 pb-4">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <span className="text-indigo-400 font-mono">03.</span> Decisões Tomadas e Deliberações
          </h2>
          <button
            type="button"
            onClick={addDecisaoRow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="text-slate-400 text-xs font-semibold uppercase border-b border-slate-900/60">
                <th className="pb-3 w-[30%]">Decisão / Acordo</th>
                <th className="pb-3 w-[25%]">Justificativa Acadêmica</th>
                <th className="pb-3 w-[25%]">Impacto no Escopo</th>
                <th className="pb-3 w-[15%]">Responsável</th>
                <th className="pb-3 text-right w-[5%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40">
              {decisoes.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Utilizar base de dados X"
                      value={row.decisao}
                      onChange={(e) => updateDecisao(idx, 'decisao', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      placeholder="Ex: Maior volume de testes na literatura"
                      value={row.justificativa}
                      onChange={(e) => updateDecisao(idx, 'justificativa', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      placeholder="Ex: Reduz cronograma em 15 dias"
                      value={row.impacto}
                      onChange={(e) => updateDecisao(idx, 'impacto', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={row.responsavel}
                      onChange={(e) => updateDecisao(idx, 'responsavel', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    >
                      <option value="Ambos">Ambos</option>
                      <option value="Orientador">Orientador</option>
                      <option value="Aluno">Aluno</option>
                    </select>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      disabled={decisoes.length === 1}
                      onClick={() => removeDecisaoRow(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. QUESTÕES CRÍTICAS E RISCOS */}
      <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-900/60 pb-4">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <span className="text-indigo-400 font-mono">04.</span> Questões Críticas e Riscos Detectados
          </h2>
          <button
            type="button"
            onClick={addRiscoRow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Risco
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="text-slate-400 text-xs font-semibold uppercase border-b border-slate-900/60">
                <th className="pb-3 w-[20%]">Dimensão</th>
                <th className="pb-3 w-[30%]">Situação Observada</th>
                <th className="pb-3 w-[15%]">Nível de Risco</th>
                <th className="pb-3 w-[20%]">Ação de Mitigação</th>
                <th className="pb-3 w-[10%]">Revisão</th>
                <th className="pb-3 text-right w-[5%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40">
              {riscos.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3 pr-4">
                    <select
                      value={row.dimensao}
                      onChange={(e) => updateRisco(idx, 'dimensao', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    >
                      <option value="Metodológica">Metodológica</option>
                      <option value="Escrita / Texto">Escrita / Texto</option>
                      <option value="Acesso a dados">Acesso a dados</option>
                      <option value="Hardware / Infra">Hardware / Infra</option>
                      <option value="Pessoal / Saúde">Pessoal / Saúde</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Falha na coleta de respostas"
                      value={row.situacao}
                      onChange={(e) => updateRisco(idx, 'situacao', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={row.nivelRisco}
                      onChange={(e) => updateRisco(idx, 'nivelRisco', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    >
                      <option value="BAIXO">🟢 Baixo</option>
                      <option value="MEDIO">🟡 Médio</option>
                      <option value="ALTO">🔴 Alto</option>
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      placeholder="Ação para contornar"
                      value={row.mitigacao}
                      onChange={(e) => updateRisco(idx, 'mitigacao', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="date"
                      value={row.revisao}
                      onChange={(e) => updateRisco(idx, 'revisao', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      disabled={riscos.length === 1}
                      onClick={() => removeRiscoRow(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. PLANO DE TRABALHO */}
      <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-900/60 pb-4">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <span className="text-indigo-400 font-mono">05.</span> Plano de Trabalho (Próximas Atividades)
          </h2>
          <button
            type="button"
            onClick={addPlanoRow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Atividade
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="text-slate-400 text-xs font-semibold uppercase border-b border-slate-900/60">
                <th className="pb-3 w-[35%]">Tarefa</th>
                <th className="pb-3 w-[25%]">Produto ou Critério de Aceite</th>
                <th className="pb-3 w-[20%]">Responsável</th>
                <th className="pb-3 w-[15%]">Prazo Limite</th>
                <th className="pb-3 text-right w-[5%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40">
              {plano.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Executar scripts com os novos parâmetros"
                      value={row.tarefa}
                      onChange={(e) => updatePlano(idx, 'tarefa', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="text"
                      placeholder="Ex: Arquivo CSV com métricas na pasta 04"
                      value={row.produto}
                      onChange={(e) => updatePlano(idx, 'produto', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <select
                      value={row.responsavelId}
                      onChange={(e) => updatePlano(idx, 'responsavelId', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    >
                      {alunos.map(aluno => (
                        <option key={aluno.id} value={aluno.id}>
                          {aluno.nome} (Aluno)
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    <input
                      type="date"
                      value={row.prazo}
                      onChange={(e) => updatePlano(idx, 'prazo', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-lg text-slate-200 text-xs outline-none"
                    />
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      disabled={plano.length === 1}
                      onClick={() => removePlanoRow(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. PERGUNTAS NORTEADORAS */}
      <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-900/60 pb-4">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <span className="text-indigo-400 font-mono">06.</span> Perguntas que devem Orientar a Próxima Entrega
          </h2>
          <button
            type="button"
            onClick={addPergunta}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar Pergunta
          </button>
        </div>

        <div className="space-y-4">
          {perguntas.map((pergunta, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-slate-500 text-xs font-bold font-mono">Q{idx + 1}.</span>
              <input
                type="text"
                required
                placeholder="Ex: Quais são as limitações da técnica adotada?"
                value={pergunta}
                onChange={(e) => updatePergunta(idx, e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
              />
              <button
                type="button"
                disabled={perguntas.length === 1}
                onClick={() => removePergunta(idx)}
                className="p-2 text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-all cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 7. PRÓXIMO ENCONTRO */}
      <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-6">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <span className="text-indigo-400 font-mono">07.</span> Planejamento do Próximo Encontro
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Data e Horário</label>
            <input
              type="datetime-local"
              value={proximaData}
              onChange={(e) => setProximaData(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Critério para considerar a entrega adequada</label>
            <input
              type="text"
              placeholder="Ex: Código-fonte rodando sem exceções e documentado"
              value={criterioAdequado}
              onChange={(e) => setCriterioAdequado(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Material a encaminhar com 72h de antecedência</label>
          <textarea
            placeholder="Ex: Relatório parcial em formato PDF..."
            rows={2}
            value={materialPrevio}
            onChange={(e) => setMaterialPrevio(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm placeholder-slate-600 transition-all outline-none resize-none"
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-semibold text-slate-400">Três decisões que o aluno precisa destravar</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Decisão 1"
              value={destravamento1}
              onChange={(e) => setDestravamento1(e.target.value)}
              className="px-4 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            />
            <input
              type="text"
              placeholder="Decisão 2"
              value={destravamento2}
              onChange={(e) => setDestravamento2(e.target.value)}
              className="px-4 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            />
            <input
              type="text"
              placeholder="Decisão 3"
              value={destravamento3}
              onChange={(e) => setDestravamento3(e.target.value)}
              className="px-4 py-2 bg-slate-900/30 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Salvar e Confirmar */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.push(`/orientador`)}
          className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm rounded-xl transition-all border border-slate-850 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          {loading ? (
            'Salvando Ata...'
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Finalizar e Registrar Ata</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
