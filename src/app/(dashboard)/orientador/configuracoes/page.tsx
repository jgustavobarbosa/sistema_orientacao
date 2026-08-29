import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PapelUsuario } from '@prisma/client';
import { salvarGoogleDriveEmail, salvarMeetFixo, salvarConfigAgenda, alternarAgenda } from './actions';
import { Settings, FolderOpen, Video, Calendar, Bell, ExternalLink, Link as LinkIcon } from 'lucide-react';

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.papel !== PapelUsuario.ORIENTADOR && session.user.papel !== PapelUsuario.ADMIN)) {
    redirect('/login');
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    select: { 
      googleDriveEmail: true, nome: true, email: true,
      linkMeetFixo: true,
      agendaAutomatica: { orderBy: { id: 'desc' }, take: 1 },
    }
  });
  if (!usuario) redirect('/login');

  const agenda = usuario.agendaAutomatica[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="border-b border-slate-900/60 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <Settings className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Configurações da Plataforma</h1>
        </div>
        <p className="text-slate-400 mt-1">
          Configure suas preferências de orientação, reuniões e notificações automáticas.
        </p>
      </div>

      {/* Card: Link do Google Meet Fixo */}
      <div className="glass border border-slate-900/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Link de Reunião Fixo</h2>
            <p className="text-xs text-slate-500">Este link será usado como padrão em todas as suas reuniões com alunos.</p>
          </div>
        </div>

        <form action={salvarMeetFixo} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Link do Google Meet (ou outra plataforma)</label>
            <input
              type="url" name="linkMeet"
              defaultValue={usuario.linkMeetFixo || ''}
              placeholder="ex: https://meet.google.com/abc-defg-hij"
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-indigo-500/50 placeholder:text-slate-600"
            />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer">
            Salvar Link
          </button>
        </form>

        {usuario.linkMeetFixo && (
          <div className="flex items-center gap-2 text-sm text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2.5">
            <LinkIcon className="h-4 w-4 shrink-0" />
            <a href={usuario.linkMeetFixo} target="_blank" rel="noopener noreferrer"
              className="underline hover:text-purple-300 truncate">{usuario.linkMeetFixo}</a>
          </div>
        )}
      </div>

      {/* Card: Pasta do Google Drive */}
      <div className="glass border border-slate-900/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Pasta de Repositório</h2>
            <p className="text-xs text-slate-500">Link da sua pasta do Google Drive usado como padrão nos projetos.</p>
          </div>
        </div>

        <form action={salvarGoogleDriveEmail} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Link da pasta (Google Drive, OneDrive, etc.)</label>
            <input
              type="url" name="emailDrive"
              defaultValue={usuario.googleDriveEmail || ''}
              placeholder="ex: https://drive.google.com/drive/folders/abc123"
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-indigo-500/50 placeholder:text-slate-600"
            />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer">
            Salvar Pasta
          </button>
        </form>

        {usuario.googleDriveEmail && (
          <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5">
            <LinkIcon className="h-4 w-4 shrink-0" />
            <a href={usuario.googleDriveEmail} target="_blank" rel="noopener noreferrer"
              className="underline hover:text-emerald-300 truncate">{usuario.googleDriveEmail}</a>
          </div>
        )}
      </div>

      {/* Card: Agenda Automática */}
      <div className="glass border border-slate-900/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Agenda Automática de Reuniões</h2>
            <p className="text-xs text-slate-500">Crie reuniões recorrentes automaticamente para todos os seus alunos.</p>
          </div>
        </div>

        <form action={salvarConfigAgenda} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Frequência</label>
              <select name="frequencia" defaultValue={agenda?.frequencia || 'QUINZENAL'}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-indigo-500/50"
              >
                <option value="QUINZENAL">Quinzenal</option>
                <option value="MENSAL">Mensal</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Dia da Semana</label>
              <select name="diaSemana" defaultValue={agenda?.diaSemana ?? 2}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-indigo-500/50"
              >
                <option value="0">Domingo</option>
                <option value="1">Segunda-feira</option>
                <option value="2">Terça-feira</option>
                <option value="3">Quarta-feira</option>
                <option value="4">Quinta-feira</option>
                <option value="5">Sexta-feira</option>
                <option value="6">Sábado</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Horário</label>
              <input type="time" name="hora" defaultValue={agenda?.hora || '14:00'}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer">
              {agenda ? 'Atualizar Agenda' : 'Ativar Agenda Automática'}
            </button>
            {agenda && (
              <form action={alternarAgenda.bind(null, agenda.id, agenda.ativo)}>
                <button className={`px-5 py-2.5 font-semibold text-sm rounded-xl border transition-all cursor-pointer ${
                  agenda.ativo
                    ? 'bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border-amber-500/20'
                    : 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border-emerald-500/20'
                }`}>
                  {agenda.ativo ? 'Pausar Agenda' : 'Reativar Agenda'}
                </button>
              </form>
            )}
          </div>
        </form>

        {agenda && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/30 rounded-xl px-4 py-2.5">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span>
              <strong className="text-slate-300">{agenda.ativo ? 'Ativo' : 'Pausado'}</strong> — 
              {agenda.frequencia === 'QUINZENAL' ? ' Quinzenal' : ' Mensal'} às 
              {['domingo','segunda','terça','quarta','quinta','sexta','sábado'][agenda.diaSemana]} {agenda.hora}
            </span>
          </div>
        )}
      </div>

      {/* Card: Notificações por E-mail */}
      <div className="glass border border-slate-900/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Notificações Automáticas</h2>
            <p className="text-xs text-slate-500">O SOIA envia e-mails automáticos para os alunos nos seguintes eventos:</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Nova reunião agendada', desc: 'Aluno recebe e-mail com link e data da reunião', active: true },
            { label: 'Lembrete de reunião (24h antes)', desc: 'Aluno recebe lembrete automático na véspera', active: true },
            { label: 'Nova revisão de capítulo', desc: 'Aluno é notificado quando orientador revisa', active: true },
            { label: 'Prazo de entrega próximo', desc: 'Alerta automático quando prazo está a 7 dias', active: true },
            { label: 'Aluno cadastrado', desc: 'E-mail de boas-vindas com link para criar senha', active: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-900/30 rounded-xl">
              <div>
                <div className="text-sm font-semibold text-slate-200">{item.label}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Ativo
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          A configuração de e-mail é feita nas variáveis de ambiente (SMTP / Resend).
        </p>
      </div>

      {/* Card: Informações da Conta */}
      <div className="glass border border-slate-900/60 rounded-2xl p-6 space-y-3">
        <h2 className="text-lg font-bold text-slate-200">Sua Conta</h2>
        <div className="space-y-1 text-sm text-slate-400">
          <p><span className="text-slate-500">Nome:</span> {usuario.nome}</p>
          <p><span className="text-slate-500">E-mail:</span> {usuario.email}</p>
          <p><span className="text-slate-500">Papel:</span> {session.user.papel}</p>
        </div>
      </div>
    </div>
  );
}