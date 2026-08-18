'use client';

import React from 'react';
import { Cpu, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface FormOnboardingProps {
  projeto: any;
  onComplete: () => void;
}

export function FormOnboardingFichaInicial({ projeto, onComplete }: FormOnboardingProps) {
  const [temaFrase, setTemaFrase] = React.useState(projeto.temaFrase || '');
  const [problemaPercebido, setProblemaPercebido] = React.useState(projeto.problemaPercebido || '');
  const [perguntaPesquisa, setPerguntaPesquisa] = React.useState(projeto.perguntaPesquisa || '');
  const [objetivoGeral, setObjetivoGeral] = React.useState(projeto.objetivoGeral || '');
  const [publicoContexto, setPublicoContexto] = React.useState(projeto.publicoContexto || '');
  const [produtoEsperado, setProdutoEsperado] = React.useState(projeto.produtoEsperado || '');
  const [acessoCampo, setAcessoCampo] = React.useState(projeto.acessoCampo || '');
  const [situacaoEtica, setSituacaoEtica] = React.useState(projeto.situacaoEtica || 'NAO_SE_APLICA');
  const [apoiosRestricoes, setApoiosRestricoes] = React.useState(projeto.apoiosRestricoes || '');
  const [normasEntrega, setNormasEntrega] = React.useState(projeto.normasEntrega || '');
  const [programa, setPrograma] = React.useState(projeto.programa || '');
  const [textoDiagnostico, setTextoDiagnostico] = React.useState(projeto.textoDiagnostico || '');

  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState('');
  const [loadingIA, setLoadingIA] = React.useState(false);

  // IA assistida para extrair campos a partir do texto inicial de diagnóstico
  const handleIAParse = async () => {
    if (!textoDiagnostico) {
      setErro('Digite primeiro o seu texto diagnóstico para a IA analisá-lo.');
      return;
    }
    setLoadingIA(true);
    setErro('');
    try {
      const res = await fetch('/api/aluno/ia-extrair-ficha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textoDiagnostico }),
      });
      if (res.ok) {
        const extraidos = await res.json();
        if (extraidos.temaFrase) setTemaFrase(extraidos.temaFrase);
        if (extraidos.problemaPercebido) setProblemaPercebido(extraidos.problemaPercebido);
        if (extraidos.perguntaPesquisa) setPerguntaPesquisa(extraidos.perguntaPesquisa);
        if (extraidos.objetivoGeral) setObjetivoGeral(extraidos.objetivoGeral);
        if (extraidos.publicoContexto) setPublicoContexto(extraidos.publicoContexto);
        if (extraidos.produtoEsperado) setProdutoEsperado(extraidos.produtoEsperado);
      } else {
        setErro('Não foi possível extrair os campos do diagnóstico de forma automatizada.');
      }
    } catch (err) {
      setErro('Erro de rede ao conectar com a IA do SOIA.');
    } finally {
      setLoadingIA(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    try {
      const res = await fetch('/api/aluno/completar-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projetoId: projeto.id,
          temaFrase,
          problemaPercebido,
          perguntaPesquisa,
          objetivoGeral,
          publicoContexto,
          produtoEsperado,
          acessoCampo,
          situacaoEtica,
          apoiosRestricoes,
          normasEntrega,
          programa,
          textoDiagnostico,
        }),
      });

      if (res.ok) {
        onComplete();
      } else {
        const txt = await res.text();
        setErro(txt || 'Erro ao registrar ficha de onboarding.');
      }
    } catch (err) {
      setErro('Falha na comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-left pt-6 pb-20">
      
      {/* Cabeçalho */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md uppercase tracking-wider">
          Etapa E0 — Acolhimento e Escopo
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight">Onboarding e Ficha Inicial</h1>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
          Antes de iniciar a redação científica, estruture o escopo do seu trabalho ({projeto.nivel}) sob a modelagem <strong>{projeto.tipoProduto}</strong>.
        </p>
      </div>

      {erro && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <p>{erro}</p>
        </div>
      )}

      {/* Editor Guiado do Diagnóstico Inicial */}
      <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-200 text-sm">Passo 1: Texto de Diagnóstico Inicial (1 a 2 páginas)</h3>
          <button
            type="button"
            onClick={handleIAParse}
            disabled={loadingIA || !textoDiagnostico}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 text-[10px] font-bold rounded-lg cursor-pointer transition-colors disabled:opacity-40"
          >
            <Sparkles className="h-3 w-3" />
            <span>{loadingIA ? 'A IA está lendo...' : 'Extrair com IA (Confirmar após)'}</span>
          </button>
        </div>
        <p className="text-xs text-slate-450 leading-relaxed">
          Escreva um texto apresentando o tema, o problema observado, por que ele importa, o contexto ou público a ser estudado, suas hipóteses teóricas e limitações. A IA auxiliará preenchendo as caixas abaixo, cabendo a você validar e editar cada campo.
        </p>
        <textarea
          required
          rows={10}
          value={textoDiagnostico}
          onChange={(e) => setTextoDiagnostico(e.target.value)}
          placeholder="Escreva aqui o rascunho inicial de 1 a 2 páginas..."
          className="w-full px-4 py-3 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none placeholder:text-slate-800 resize-none font-mono leading-relaxed"
        />
      </div>

      {/* Formulário de 18 Campos Padronizados */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass p-6 rounded-2xl border border-slate-900/60 space-y-6">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-900/60 pb-3">Passo 2: Ficha Técnica e Delimitação</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Programa / Curso / Instituição</label>
              <input
                type="text"
                required
                value={programa}
                onChange={(e) => setPrograma(e.target.value)}
                placeholder="ex: Programa de Pós-Graduação em Computação"
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tema em uma Frase</label>
              <input
                type="text"
                required
                value={temaFrase}
                onChange={(e) => setTemaFrase(e.target.value)}
                placeholder="ex: Avaliação de desempenho de algoritmos de visão computacional em hardware de baixo custo"
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Problema Percebido</label>
            <textarea
              required
              rows={3}
              value={problemaPercebido}
              onChange={(e) => setProblemaPercebido(e.target.value)}
              placeholder="Descreva detalhadamente a lacuna ou problema de pesquisa..."
              className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pergunta de Pesquisa</label>
              <input
                type="text"
                required
                value={perguntaPesquisa}
                onChange={(e) => setPerguntaPesquisa(e.target.value)}
                placeholder="ex: De que forma o algoritmo X se comporta sob limitações de RAM de 1GB?"
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Objetivo Geral</label>
              <input
                type="text"
                required
                value={objetivoGeral}
                onChange={(e) => setObjetivoGeral(e.target.value)}
                placeholder="ex: Avaliar e catalogar tempos de processamento..."
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Público / Contexto</label>
              <input
                type="text"
                required
                value={publicoContexto}
                onChange={(e) => setPublicoContexto(e.target.value)}
                placeholder="ex: Dispositivos móveis antigos e hardware integrado ARM"
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Produto Esperado</label>
              <input
                type="text"
                required
                value={produtoEsperado}
                onChange={(e) => setProdutoEsperado(e.target.value)}
                placeholder="ex: Protótipo funcional de detecção e relatório de performance"
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Situação Ética</label>
              <select
                value={situacaoEtica}
                onChange={(e) => setSituacaoEtica(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none"
              >
                <option value="NAO_SE_APLICA">Não se aplica (Pesquisa bibliográfica/teórica)</option>
                <option value="ANALISE_DOCUMENTAL">Análise Documental apenas</option>
                <option value="SUBMISSAO_NECESSARIA">Submissão ao Comitê CEP/CONEP necessária</option>
                <option value="APROVACAO_EM_ANDAMENTO">Aprovação CEP em andamento</option>
                <option value="APROVADO">Aprovado pelo Comitê CEP</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Acesso a Campo / Dados</label>
              <input
                type="text"
                required
                value={acessoCampo}
                onChange={(e) => setAcessoCampo(e.target.value)}
                placeholder="ex: Confirmado acesso aos datasets públicos da UFMG"
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Normas / Regulamento de Entrega</label>
              <input
                type="text"
                required
                value={normasEntrega}
                onChange={(e) => setNormasEntrega(e.target.value)}
                placeholder="Link para regulamento do TCC ou manual ABNT"
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Apoios e Restrições</label>
              <input
                type="text"
                value={apoiosRestricoes}
                onChange={(e) => setApoiosRestricoes(e.target.value)}
                placeholder="Restrições financeiras, prazos ou dependências (opcional)"
                className="w-full px-4 py-2.5 bg-slate-950/40 border border-slate-900 focus:border-blue-500/50 rounded-xl text-slate-100 text-xs outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !temaFrase || !problemaPercebido || !perguntaPesquisa || !textoDiagnostico}
          className="group relative flex w-full items-center justify-between gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-md shadow-blue-600/10 cursor-pointer disabled:opacity-40"
        >
          <span>{loading ? 'Processando Ficha de Onboarding...' : 'Confirmar e Iniciar Percurso Científico (Etapa E1)'}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  );
}
