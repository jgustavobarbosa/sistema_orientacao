import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { BookOpen, HelpCircle, Users, Calendar, FileText, Settings, Bell, Shield, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    q: 'Como cadastrar um novo aluno?',
    a: 'Vá em "Meus Alunos" e preencha o formulário "Novo Orientando" com nome, e-mail e nível de acesso. O aluno receberá um e-mail com link para criar a senha.',
  },
  {
    q: 'Como funciona o fluxo de revisão de capítulos?',
    a: 'O aluno submete um capítulo em "Redação". Você recebe notificação, lê o texto, faz comentários inline e devolve. O aluno responde e o ciclo continua até aprovação.',
  },
  {
    q: 'Como agendar reuniões?',
    a: 'Vá em "Agenda" e crie um evento. O sistema envia e-mail automático para o aluno com data, horário e link do Google Meet. Após a reunião, registre a ata no sistema.',
  },
  {
    q: 'O que são os marcos acadêmicos?',
    a: 'Marcos são metas do projeto: capítulos, apresentações, qualificação, defesa. Você define prazos e o aluno marca como concluído. Acompanhe o progresso no dashboard do aluno.',
  },
  {
    q: 'Como funciona a auditoria de IA?',
    a: 'Na revisão de capítulos, clique em "Auditoria IA" para analisar o texto. O sistema gera score, pontos fortes, lacunas e recomendações. Isso auxilia sua avaliação.',
  },
  {
    q: 'Como configurar a agenda automática?',
    a: 'Vá em "Configurações", seção "Agenda Automática". Escolha frequência (quinzenal/mensal), dia da semana e horário. O sistema cria reuniões automaticamente para todos os alunos.',
  },
  {
    q: 'Como vincular meu Google Drive?',
    a: 'Em "Configurações", cole o link da sua pasta do Google Drive na seção "Pasta de Repositório". Esse link será usado como padrão nos projetos. Você pode personalizar por aluno depois.',
  },
  {
    q: 'Como funciona o link de reunião fixo?',
    a: 'Em "Configurações", defina um link do Google Meet fixo. Todas as reuniões automáticas usarão esse link. Você pode alterar por reunião individualmente depois.',
  },
  {
    q: 'O que fazer se um aluno não confirma e-mail?',
    a: 'Você pode reenviar o e-mail de confirmação ou resetar a senha na página de edição do aluno. Se precisar de ajuda, o administrador pode forçar a ativação.',
  },
  {
    q: 'Como emitir parecer de reunião?',
    a: 'Após a reunião, acesse o registro e vá em "Parecer". Preencha os campos: avanços, decisões, riscos, plano de trabalho. O aluno vê automaticamente no dashboard.',
  },
  {
    q: 'Posso acessar como administrador e orientador?',
    a: 'Sim. Se você tem papel ADMIN, vê ambos os menus na sidebar. Use "Meus Alunos" para orientação e o menu "Admin" para gestão do sistema.',
  },
];

export default function ManualProfessorPage() {
  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-300">
      <div className="border-b border-slate-900/60 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manual do Professor / Orientador</h1>
        </div>
        <p className="text-slate-400 mt-1">
          Guia completo para usar o SOIA na orientação de alunos.
        </p>
      </div>

      {/* Visão Geral */}
      <div className="glass border border-slate-900/60 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-400" />
          Seu Papel no SOIA
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Como orientador, você gerencia alunos, agenda reuniões, revisa capítulos, emite pareceres 
          e acompanha o progresso acadêmico. O SOIA centraliza toda a comunicação e documentação 
          da orientação, eliminando a necessidade de e-mails dispersos e versões soltas de documentos.
        </p>
      </div>

      {/* Cards de Funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Users, title: 'Gestão de Alunos', desc: 'Cadastre, autorize, edite e acompanhe todos os orientandos.', color: 'text-emerald-400 bg-emerald-500/10' },
          { icon: Calendar, title: 'Agenda', desc: 'Agende reuniões individuais ou em lote com agenda automática.', color: 'text-purple-400 bg-purple-500/10' },
          { icon: FileText, title: 'Revisão de Capítulos', desc: 'Comente inline, peça revisões, use auditoria IA.', color: 'text-amber-400 bg-amber-500/10' },
          { icon: Settings, title: 'Configurações', desc: 'Link do Drive, Meet fixo, agenda automática, notificações.', color: 'text-blue-400 bg-blue-500/10' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass border border-slate-900/60 rounded-xl p-5">
              <div className={`inline-flex p-2.5 rounded-xl border ${card.color} border-current/20 mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-200 mb-1">{card.title}</h3>
              <p className="text-xs text-slate-400">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="glass border border-slate-900/60 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-amber-400" />
          Perguntas Frequentes
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-slate-900/30 rounded-xl border border-slate-800/60 overflow-hidden">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-slate-200 hover:text-slate-100 transition-colors list-none">
                <span>{faq.q}</span>
                <ChevronDown className="h-4 w-4 text-slate-500 group-open:rotate-180 transition-transform shrink-0" />
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed border-t border-slate-800/40 pt-3">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Suporte */}
      <div className="glass border border-slate-900/60 rounded-2xl p-6 text-center">
        <p className="text-sm text-slate-400">
          Dúvidas técnicas ou suporte? Entre em contato com o administrador da plataforma.
        </p>
      </div>
    </div>
  );
}