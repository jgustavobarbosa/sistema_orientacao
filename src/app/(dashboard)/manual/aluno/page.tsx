import React from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { BookOpen, HelpCircle, FileText, Calendar, UserPlus, Key, AlertCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    q: 'Como fazer login na plataforma?',
    a: 'Acesse soiaia.duckdns.org e use o e-mail e senha fornecidos pelo seu orientador. Se for seu primeiro acesso, use o link enviado por e-mail para criar uma senha.',
  },
  {
    q: 'Esqueci minha senha. O que fazer?',
    a: 'Na tela de login, clique em "Esqueci minha senha". Digite seu e-mail cadastrado e você receberá um link para redefinição. Se não receber, verifique a caixa de spam ou peça ao seu orientador para resetar.',
  },
  {
    q: 'Como funciona o dashboard do aluno?',
    a: 'Ao entrar, você vê seu projeto de pesquisa, tarefas pendentes, marcos acadêmicos e o próximo encontro agendado. Se ainda não tiver um projeto, você pode criar uma proposta de pesquisa.',
  },
  {
    q: 'Como enviar um capítulo para revisão?',
    a: 'Vá em "Redação de Capítulos" no menu lateral. Selecione o capítulo desejado, escreva ou cole o texto e clique em "Submeter para Revisão". O orientador será notificado.',
  },
  {
    q: 'Como funcionam as reuniões?',
    a: 'As reuniões são agendadas pelo orientador. Você recebe um e-mail com a data, horário e link do Google Meet. Após a reunião, o orientador registra a ata, que fica disponível em "Minhas Reuniões".',
  },
  {
    q: 'O que é a Biblioteca?',
    a: 'A Biblioteca é onde o orientador indica leituras recomendadas para você. Acesse pelo menu "Minha Biblioteca" para ver artigos, livros e materiais sugeridos.',
  },
  {
    q: 'Como anexar documentos?',
    a: 'Vá em "Meus Documentos" e clique em "Adicionar Documento". Você pode enviar arquivos como PDF, Word ou imagens. Eles ficam disponíveis para o orientador visualizar e comentar.',
  },
  {
    q: 'Recebo notificações por e-mail?',
    a: 'Sim. O sistema envia e-mails automáticos para: nova reunião agendada, lembrete 24h antes, nova revisão de capítulo, prazos próximos e quando o orientador registra uma ata.',
  },
  {
    q: 'O que é o parecer da IA?',
    a: 'O SOIA usa inteligência artificial para analisar seus textos e gerar um parecer com pontuação, pontos fortes, lacunas e orientações. Isso ajuda a melhorar a qualidade acadêmica antes da revisão do orientador.',
  },
  {
    q: 'Como atualizar meus dados?',
    a: 'Na página de Configurações, você pode ver suas informações de conta. Para alterar nome ou e-mail, solicite ao administrador do sistema.',
  },
];

export default function ManualAlunoPage() {
  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-300">
      <div className="border-b border-slate-900/60 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manual do Aluno</h1>
        </div>
        <p className="text-slate-400 mt-1">
          Guia completo para usar o SOIA — Sistema de Orientação Inteligente Avançado.
        </p>
      </div>

      {/* Visão Geral */}
      <div className="glass border border-slate-900/60 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-blue-400" />
          Visão Geral
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          O SOIA conecta você ao seu orientador de forma organizada. Aqui você pode acompanhar seu projeto de pesquisa, 
          submeter capítulos para revisão, participar de reuniões agendadas, acessar materiais recomendados na biblioteca 
          e receber feedback da inteligência artificial sobre seus textos. Tudo em um só lugar.
        </p>
      </div>

      {/* Cards de Navegação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Calendar, title: 'Reuniões', desc: 'Veja reuniões agendadas, acesse atas e histórico de encontros.', color: 'text-purple-400 bg-purple-500/10' },
          { icon: FileText, title: 'Redação', desc: 'Submeta capítulos, veja revisões e responda ao orientador.', color: 'text-emerald-400 bg-emerald-500/10' },
          { icon: BookOpen, title: 'Biblioteca', desc: 'Acesse materiais e leituras recomendadas pelo orientador.', color: 'text-amber-400 bg-amber-500/10' },
          { icon: UserPlus, title: 'Documentos', desc: 'Envie e gerencie documentos do seu projeto.', color: 'text-indigo-400 bg-indigo-500/10' },
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
          <AlertCircle className="h-5 w-5 text-amber-400" />
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
          Ainda com dúvidas? Entre em contato com seu orientador ou com o administrador da plataforma.
        </p>
      </div>
    </div>
  );
}