import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { salvarGoogleDriveEmail } from './actions';
import { Settings, FolderOpen, ExternalLink, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.papel !== 'ORIENTADOR') {
    redirect('/login');
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    select: { googleDriveEmail: true, nome: true, email: true }
  });

  if (!usuario) redirect('/login');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="border-b border-slate-900/60 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <Settings className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Configurações</h1>
        </div>
        <p className="text-slate-400 mt-1">
          Configure suas pastas de repositório e preferências.
        </p>
      </div>

      {/* Card: Pasta do Google Drive */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-5 w-5 text-emerald-400" />
          <h2 className="text-xl font-bold">Pasta de Repositório</h2>
        </div>
        <p className="text-slate-400 text-sm">
          Cole o link da sua pasta do Google Drive (ou outro repositório) que será usado como padrão
          para os projetos de orientação. Você pode criar subpastas manualmente para cada aluno.
        </p>

        <form action={salvarGoogleDriveEmail} className="space-y-3">
          <div>
            <label htmlFor="emailDrive" className="block text-sm font-medium text-slate-300 mb-1">
              Link da pasta (Google Drive, OneDrive, etc.)
            </label>
            <input
              type="url"
              id="emailDrive"
              name="emailDrive"
              defaultValue={usuario.googleDriveEmail || ''}
              placeholder="ex: https://drive.google.com/drive/folders/abc123"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Deixe em branco se não quiser usar repositório externo.
            </p>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-colors cursor-pointer"
          >
            Salvar Configuração
          </button>
        </form>

        {usuario.googleDriveEmail && (
          <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <LinkIcon className="h-4 w-4 shrink-0" />
            <a href={usuario.googleDriveEmail} target="_blank" rel="noopener noreferrer"
              className="underline hover:text-emerald-300 truncate max-w-full">
              {usuario.googleDriveEmail}
            </a>
          </div>
        )}
      </div>

      {/* Card: Sobre o repositório */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-3">
        <h2 className="text-lg font-bold text-slate-200">Como funciona</h2>
        <div className="space-y-2 text-sm text-slate-400 leading-relaxed">
          <p><strong className="text-slate-300">1.</strong> Crie uma pasta no seu Google Drive (ou outro serviço).</p>
          <p><strong className="text-slate-300">2.</strong> Cole o link dela aqui — será usado como pasta padrão nos projetos.</p>
          <p><strong className="text-slate-300">3.</strong> Ao vincular um aluno, o sistema salva o link da pasta no projeto.</p>
          <p><strong className="text-slate-300">4.</strong> Você pode editar o link do projeto depois, se precisar de pastas diferentes.</p>
        </div>
      </div>

      {/* Card: Informações da Conta */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-3">
        <h2 className="text-lg font-bold text-slate-200">Sua Conta</h2>
        <div className="space-y-1 text-sm text-slate-400">
          <p><span className="text-slate-500">Nome:</span> {usuario.nome}</p>
          <p><span className="text-slate-500">E-mail:</span> {usuario.email}</p>
        </div>
        <Link
          href="/orientador"
          className="inline-block text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          ← Voltar ao painel
        </Link>
      </div>
    </div>
  );
}