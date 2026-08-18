'use client';

import React, { useState } from 'react';
import { Sparkles, FileText, Send, GraduationCap, AlertCircle } from 'lucide-react';
import { proporProjeto } from '@/app/actions';

interface OrientadorOption {
  id: string;
  nome: string;
  email: string;
}

interface FormPropostaProps {
  orientandoId: string;
  orientadores: OrientadorOption[];
}

export function FormPropostaProjeto({ orientandoId, orientadores }: FormPropostaProps) {
  const [loadingIA, setLoadingIA] = useState(false);
  const [iaSuccess, setIaSuccess] = useState<string | null>(null);

  // Estados do formulário
  const [orientadorId, setOrientadorId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [perguntaPesquisa, setPerguntaPesquisa] = useState('');
  const [nivel, setNivel] = useState('TCC');
  const [programa, setPrograma] = useState('');
  const [prazoDefesa, setPrazoDefesa] = useState('');

  const handleUploadPlano = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setLoadingIA(true);
    setIaSuccess(null);

    const formData = new FormData();
    formData.append('arquivo', arquivo);

    try {
      const res = await fetch('/api/ia/extrair-plano', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.sucesso) {
        setTitulo(data.titulo || '');
        setPerguntaPesquisa(data.perguntaPesquisa || '');
        setNivel(data.nivel || 'TCC');
        setPrograma(data.programa || '');
        setIaSuccess(`Dados extraídos com sucesso do arquivo "${arquivo.name}" pelo Gemini!`);
      } else {
        alert(data.error || 'Falha ao processar o plano com IA.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao enviar o plano.');
    } finally {
      setLoadingIA(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="text-center space-y-2">
        <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Propor Projeto de Orientação</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Preencha os dados da sua pesquisa acadêmica ou envie o seu plano de orientação para preenchimento automático com IA.
        </p>
      </div>

      {/* Caixa de Upload Assistido por IA */}
      <div className="glass p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-950 via-indigo-950/10 to-slate-950 space-y-4 shadow-lg shadow-indigo-500/5">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <div>
            <h3 className="font-bold text-slate-200 text-sm">Preenchimento com Gemini (IA)</h3>
            <p className="text-xs text-slate-400">Envie o arquivo do seu Plano de Trabalho / Pesquisa para extrair dados na hora.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="relative flex flex-col items-center justify-center p-5 border border-dashed border-slate-800 hover:border-indigo-500/40 bg-slate-900/20 hover:bg-indigo-950/5 rounded-xl cursor-pointer transition-all duration-200 group text-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.odt"
              onChange={handleUploadPlano}
              disabled={loadingIA}
              className="hidden"
            />
            <FileText className="h-7 w-7 text-slate-600 group-hover:text-indigo-400 transition-colors mb-2" />
            <span className="text-xs font-semibold text-slate-350">
              {loadingIA ? 'Gemini lendo plano de pesquisa...' : 'Selecionar arquivo de Plano de Orientação'}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">PDF, DOCX, TXT até 10MB</span>
          </label>

          {iaSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full shrink-0 animate-ping" />
              <span>{iaSuccess}</span>
            </div>
          )}
        </div>
      </div>

      {/* Formulário Principal */}
      <div className="glass p-6 rounded-2xl border border-slate-900/60">
        <form action={proporProjeto} className="space-y-5">
          <input type="hidden" name="orientandoId" value={orientandoId} />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">Escolha seu Orientador (Professor)</label>
            <select
              name="orientadorId"
              value={orientadorId}
              onChange={(e) => setOrientadorId(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            >
              <option value="">Selecione o professor orientador...</option>
              {orientadores.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome} ({o.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">Título do Projeto</label>
            <input
              type="text"
              name="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              placeholder="Ex: Análise Comparativa de Frameworks Javascript"
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">Pergunta de Pesquisa Vigente</label>
            <textarea
              name="perguntaPesquisa"
              value={perguntaPesquisa}
              onChange={(e) => setPerguntaPesquisa(e.target.value)}
              placeholder="A pergunta científica central do seu trabalho..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Nível</label>
              <select
                name="nivel"
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
              >
                <option value="IC">Iniciação Científica (IC)</option>
                <option value="TCC">Trabalho de Conclusão (TCC)</option>
                <option value="MESTRADO">Mestrado</option>
                <option value="DOUTORADO">Doutorado</option>
                <option value="POS_DOC">Pós-Doutorado (Pós-Doc)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Programa Acadêmico</label>
              <input
                type="text"
                name="programa"
                value={programa}
                onChange={(e) => setPrograma(e.target.value)}
                placeholder="Ex: Engenharia de Software"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">Prazo de Defesa Proposto (Opcional)</label>
            <input
              type="date"
              name="prazoDefesa"
              value={prazoDefesa}
              onChange={(e) => setPrazoDefesa(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            Enviar Proposta para o Orientador
          </button>
        </form>
      </div>
    </div>
  );
}
