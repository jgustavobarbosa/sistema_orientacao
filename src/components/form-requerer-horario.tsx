'use client';

import React from 'react';
import { agendarReuniao } from '@/app/actions';
import { Calendar, HelpCircle } from 'lucide-react';

interface Slot {
  id: string;
  slotId: string;
  dataIso: string;
  label: string;
}

interface FormRequererHorarioProps {
  slotsCombinados: Slot[];
  orientandoId: string;
}

export function FormRequererHorario({ slotsCombinados, orientandoId }: FormRequererHorarioProps) {
  const [horarioCombinado, setHorarioCombinado] = React.useState('');
  const [objetivo, setObjetivo] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [erro, setErro] = React.useState('');
  const [sucesso, setSucesso] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!horarioCombinado || !objetivo.trim()) return;
    setLoading(true);
    setErro('');
    setSucesso('');

    const formData = new FormData();
    formData.append('horarioCombinado', horarioCombinado);
    formData.append('objetivo', objetivo);

    try {
      await agendarReuniao(orientandoId, formData);
      setSucesso('🎉 Horário agendado com sucesso!');
      setHorarioCombinado('');
      setObjetivo('');
      // Recarregar após 1.5 segundos
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setErro(err.message || 'Erro ao agendar reunião.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl border border-slate-900/60 flex flex-col space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
          <Calendar className="h-5 w-5" />
        </div>
        <h3 className="font-bold text-slate-200">Requerer Horário</h3>
      </div>

      {erro && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl font-medium">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs rounded-xl font-medium">
          {sucesso}
        </div>
      )}

      {slotsCombinados.length === 0 ? (
        <div className="p-4 bg-slate-900/40 border border-slate-900/60 rounded-xl text-center space-y-1">
          <HelpCircle className="h-6 w-6 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-400">Sem horários disponibilizados.</p>
          <p className="text-[10px] text-slate-500">Seu orientador ainda não cadastrou slots de disponibilidade.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="horarioCombinado" className="text-xs font-semibold text-slate-400">
              Selecione o Dia e Horário Disponível
            </label>
            <select
              id="horarioCombinado"
              name="horarioCombinado"
              required
              value={horarioCombinado}
              onChange={(e) => setHorarioCombinado(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none"
            >
              <option value="">Escolha um slot livre da agenda...</option>
              {slotsCombinados.map((slot) => (
                <option key={slot.id} value={`${slot.dataIso}_${slot.slotId}`}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="objetivo" className="text-xs font-semibold text-slate-400">
              Objetivo / Pauta da Orientação
            </label>
            <textarea
              id="objetivo"
              name="objetivo"
              required
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Explicite o que pretende discutir ou apresentar..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 focus:border-indigo-500/50 rounded-xl text-slate-100 text-sm outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !horarioCombinado || !objetivo}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors disabled:opacity-50"
          >
            {loading ? 'Agendando...' : 'Requerer Agendamento'}
          </button>
        </form>
      )}
    </div>
  );
}
