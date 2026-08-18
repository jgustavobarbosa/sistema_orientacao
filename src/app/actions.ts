'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ==========================================
// AÇÕES DE ALUNOS (ORIENTANDOS)
// ==========================================

export async function criarAluno(formData: FormData) {
  const nome = formData.get('nome') as string;
  const email = formData.get('email') as string;
  const ativo = formData.get('ativo') === 'true';

  if (!nome || !email) {
    return redirect('/orientador/alunos?error=CamposObrigatorios');
  }

  if (!email.includes('@') || email.length < 5) {
    return redirect('/orientador/alunos?error=EmailInvalido');
  }

  try {
    const { prisma } = await import('@/lib/db');
    const { PapelUsuario } = await import('@prisma/client');

    const emailFormatado = email.toLowerCase().trim();

    // Validar duplicidade
    const existente = await prisma.usuario.findUnique({
      where: { email: emailFormatado }
    });

    if (existente) {
      return redirect('/orientador/alunos?error=EmailDuplicado');
    }

    await prisma.usuario.create({
      data: {
        nome,
        email: emailFormatado,
        papel: PapelUsuario.ORIENTANDO,
        ativo,
      },
    });
    revalidatePath('/orientador/alunos');
  } catch (error: any) {
    if (error.message?.includes('redirect')) {
      throw error;
    }
    console.error('Erro ao criar aluno:', error);
    return redirect('/orientador/alunos?error=ErroInterno');
  }
}

export async function alternarStatus(id: string, statusAtual: boolean) {
  try {
    const { prisma } = await import('@/lib/db');

    await prisma.usuario.update({
      where: { id },
      data: { ativo: !statusAtual },
    });
    revalidatePath('/orientador/alunos');
  } catch (error) {
    console.error('Erro ao alternar status do aluno:', error);
  }
}

export async function removerAluno(id: string) {
  try {
    const { prisma } = await import('@/lib/db');

    await prisma.usuario.delete({
      where: { id },
    });
    revalidatePath('/orientador/alunos');
  } catch (error) {
    console.error('Erro ao remover aluno:', error);
  }
}

export async function editarAluno(formData: FormData) {
  const id = formData.get('id') as string;
  const nome = formData.get('nome') as string;
  const email = formData.get('email') as string;

  if (!id || !nome || !email) {
    return redirect('/orientador/alunos?error=CamposObrigatorios');
  }

  if (!email.includes('@') || email.length < 5) {
    return redirect('/orientador/alunos?error=EmailInvalido');
  }

  try {
    const { prisma } = await import('@/lib/db');

    const emailFormatado = email.toLowerCase().trim();

    // Validar se e-mail já existe em outro ID
    const existente = await prisma.usuario.findFirst({
      where: {
        email: emailFormatado,
        id: { not: id }
      }
    });

    if (existente) {
      return redirect('/orientador/alunos?error=EmailDuplicado');
    }

    await prisma.usuario.update({
      where: { id },
      data: {
        nome,
        email: emailFormatado
      }
    });

    revalidatePath('/orientador/alunos');
  } catch (error: any) {
    if (error.message?.includes('redirect')) {
      throw error;
    }
    console.error('Erro ao editar aluno:', error);
    return redirect('/orientador/alunos?error=ErroInterno');
  }
}

// ==========================================
// AÇÕES DE PROJETOS E MARCOS
// ==========================================

export async function criarProjeto(formData: FormData) {
  const orientadorId = formData.get('orientadorId') as string;
  const orientandoId = formData.get('orientandoId') as string;
  const titulo = formData.get('titulo') as string;
  const perguntaPesquisa = formData.get('perguntaPesquisa') as string;
  const nivelRaw = formData.get('nivel') as string;
  const programa = formData.get('programa') as string;
  const prazoDefesaRaw = formData.get('prazoDefesa') as string;

  if (!orientandoId || !titulo || !nivelRaw) return;

  const prazoDefesa = prazoDefesaRaw ? new Date(prazoDefesaRaw) : null;

  try {
    const { prisma } = await import('@/lib/db');
    const { criarEstruturaPastasDrive } = await import('@/lib/google');
    const { NivelProjeto, StatusProjeto } = await import('@prisma/client');

    const nivel = nivelRaw as any; // Cast compatível

    const aluno = await prisma.usuario.findUnique({
      where: { id: orientandoId }
    });

    let driveFolderId: string | null = null;
    if (aluno) {
      driveFolderId = await criarEstruturaPastasDrive(aluno.nome, titulo);
    }

    const projeto = await prisma.projetoOrientacao.create({
      data: {
        orientadorId,
        orientandoId,
        titulo,
        perguntaPesquisa,
        nivel: nivel as any,
        programa,
        prazoDefesa,
        status: StatusProjeto.EM_ANDAMENTO,
        driveFolderId,
      },
    });

    const marcosPadrao = [
      { titulo: 'Plano de Orientação', tipo: 'CHECKLIST', prazoMeses: 1 },
      { titulo: 'Revisão Bibliográfica', tipo: 'REVISAO', prazoMeses: 3 },
      { titulo: 'Qualificação', tipo: 'QUALIFICACAO', prazoMeses: 6 },
      { titulo: 'Escrita do Manuscrito', tipo: 'CAPITULO', prazoMeses: 9 },
      { titulo: 'Defesa Final', tipo: 'DEFESA', prazoMeses: 12 },
    ];

    const dataBase = new Date();
    await prisma.$transaction(
      marcosPadrao.map((marco) => {
        const dataPrevista = new Date();
        dataPrevista.setMonth(dataBase.getMonth() + marco.prazoMeses);
        return prisma.marcoAcademico.create({
          data: {
            projetoId: projeto.id,
            titulo: marco.titulo,
            tipo: marco.tipo as any,
            dataPrevista,
            responsavelId: orientandoId,
            status: 'A_FAZER',
          },
        });
      })
    );

    revalidatePath('/orientador');
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
  }
}

export async function criarMarcoPersonalizado(formData: FormData) {
  const projetoId = formData.get('projetoId') as string;
  const orientandoId = formData.get('orientandoId') as string;
  const titulo = formData.get('titulo') as string;
  const tipoRaw = formData.get('tipo') as string;
  const descricao = formData.get('descricao') as string;
  const dataPrevistaRaw = formData.get('dataPrevista') as string;

  if (!projetoId || !titulo || !dataPrevistaRaw) return;

  try {
    const { prisma } = await import('@/lib/db');
    const { StatusMarco } = await import('@prisma/client');

    const tipo = tipoRaw as any;

    await prisma.marcoAcademico.create({
      data: {
        projetoId,
        titulo,
        tipo,
        descricao,
        dataPrevista: new Date(dataPrevistaRaw),
        responsavelId: orientandoId,
        status: StatusMarco.A_FAZER,
      },
    });
    revalidatePath(`/orientador/alunos/${orientandoId}`);
  } catch (error) {
    console.error('Erro ao criar marco personalizado:', error);
  }
}

export async function alternarMarcoStatus(id: string, orientandoId: string, statusAtual: string) {
  try {
    const { prisma } = await import('@/lib/db');
    const { StatusMarco } = await import('@prisma/client');

    const novoStatus = statusAtual === StatusMarco.CONCLUIDO ? StatusMarco.A_FAZER : StatusMarco.CONCLUIDO;
    const dataConclusao = novoStatus === StatusMarco.CONCLUIDO ? new Date() : null;

    await prisma.marcoAcademico.update({
      where: { id },
      data: { 
        status: novoStatus,
        dataConclusao 
      },
    });
    revalidatePath(`/orientador/alunos/${orientandoId}`);
    revalidatePath('/aluno');
  } catch (error) {
    console.error('Erro ao alternar status do marco:', error);
  }
}

export async function deletarMarco(id: string, orientandoId: string) {
  try {
    const { prisma } = await import('@/lib/db');

    await prisma.marcoAcademico.delete({
      where: { id },
    });
    revalidatePath(`/orientador/alunos/${orientandoId}`);
  } catch (error) {
    console.error('Erro ao deletar marco:', error);
  }
}

// ==========================================
// AÇÕES DO ALUNO: TAREFAS
// ==========================================

export async function alternarTarefa(id: string, concluidaAtualmente: boolean) {
  try {
    const { prisma } = await import('@/lib/db');

    await prisma.tarefaReuniao.update({
      where: { id },
      data: { concluida: !concluidaAtualmente },
    });
    revalidatePath('/aluno');
  } catch (error) {
    console.error('Erro ao alternar status da tarefa:', error);
  }
}

// ==========================================
// AÇÕES DE DOCUMENTOS
// ==========================================

export async function enviarDocumento(formData: FormData) {
  const projetoId = formData.get('projetoId') as string;
  const alunoId = formData.get('alunoId') as string;
  const titulo = formData.get('titulo') as string;
  const categoriaRaw = formData.get('categoria') as string;
  const arquivo = formData.get('arquivo') as File;

  if (!projetoId || !titulo || !categoriaRaw || !arquivo) return;

  try {
    const { prisma } = await import('@/lib/db');
    const { gerarParecerLLM } = await import('@/lib/gemini');

    const categoria = categoriaRaw as any;
    const driveFileId = `drive-${Date.now()}-${arquivo.name}`;
    const tamanhoBytes = BigInt(arquivo.size);

    const doc = await prisma.documento.create({
      data: {
        projetoId,
        categoria,
        titulo,
        driveFileId,
        tamanhoBytes,
        enviadoPorId: alunoId,
        versao: 1
      }
    });

    let textoDocumento = `Conteúdo simulado do arquivo acadêmico "${arquivo.name}".\n`;
    textoDocumento += `Título do Trabalho: ${titulo}\n`;
    textoDocumento += `Este arquivo é classificado sob a categoria de ${categoria}.\n`;

    const parecer = await gerarParecerLLM(titulo, categoria, textoDocumento);

    await prisma.parecerLLM.create({
      data: {
        documentoId: doc.id,
        resumo: parecer.resumo,
        pontosFortes: parecer.pontosFortes,
        lacunas: parecer.lacunas,
        orientacoesProximasEtapas: parecer.orientacoesProximasEtapas,
        modeloUsado: 'gemini-1.5-flash'
      }
    });

    revalidatePath('/aluno/documentos');
    revalidatePath(`/orientador/alunos/${alunoId}`);
  } catch (error) {
    console.error('Erro ao enviar documento:', error);
  }
}

export async function editarProjeto(formData: FormData) {
  const projetoId = formData.get('projetoId') as string;
  const orientandoId = formData.get('orientandoId') as string;
  const titulo = formData.get('titulo') as string;
  const perguntaPesquisa = formData.get('perguntaPesquisa') as string;
  const nivelRaw = formData.get('nivel') as string;
  const programa = formData.get('programa') as string;
  const prazoDefesaRaw = formData.get('prazoDefesa') as string;

  if (!projetoId || !titulo || !nivelRaw) return;

  const prazoDefesa = prazoDefesaRaw ? new Date(prazoDefesaRaw) : null;

  try {
    const { prisma } = await import('@/lib/db');

    await prisma.projetoOrientacao.update({
      where: { id: projetoId },
      data: {
        titulo,
        perguntaPesquisa,
        nivel: nivelRaw as any,
        programa,
        prazoDefesa,
      },
    });

    revalidatePath(`/orientador/alunos/${orientandoId}`);
  } catch (error) {
    console.error('Erro ao editar projeto:', error);
  }
}

export async function proporProjeto(formData: FormData) {
  const orientandoId = formData.get('orientandoId') as string;
  const orientadorId = formData.get('orientadorId') as string;
  const titulo = formData.get('titulo') as string;
  const perguntaPesquisa = formData.get('perguntaPesquisa') as string;
  const nivelRaw = formData.get('nivel') as string;
  const programa = formData.get('programa') as string;
  const prazoDefesaRaw = formData.get('prazoDefesa') as string;

  if (!orientandoId || !orientadorId || !titulo || !nivelRaw) return;

  const prazoDefesa = prazoDefesaRaw ? new Date(prazoDefesaRaw) : null;

  try {
    const { prisma } = await import('@/lib/db');
    const { StatusProjeto } = await import('@prisma/client');

    await prisma.projetoOrientacao.create({
      data: {
        orientandoId,
        orientadorId,
        titulo,
        perguntaPesquisa,
        nivel: nivelRaw as any,
        programa,
        prazoDefesa,
        status: StatusProjeto.PROPOSTA,
      },
    });

    revalidatePath('/aluno');
  } catch (error) {
    console.error('Erro ao propor projeto:', error);
  }
}

export async function aprovarProjeto(projetoId: string, orientandoId: string) {
  try {
    const { prisma } = await import('@/lib/db');
    const { StatusProjeto, TipoMarco, StatusMarco } = await import('@prisma/client');

    // 1. Atualizar o status do projeto para EM_ANDAMENTO
    const projeto = await prisma.projetoOrientacao.update({
      where: { id: projetoId },
      data: { status: StatusProjeto.EM_ANDAMENTO },
    });

    // 2. Inicializar marcos padrão para o aluno
    const hoje = new Date();
    const dataQualificacao = new Date(hoje.getTime() + 180 * 24 * 60 * 60 * 1000); // 6 meses
    const dataDefesa = projeto.prazoDefesa || new Date(hoje.getTime() + 360 * 24 * 60 * 60 * 1000); // 12 meses ou prazo inserido

    await prisma.marcoAcademico.createMany({
      data: [
        {
          projetoId,
          titulo: 'Definição da Pergunta de Pesquisa e Cronograma',
          tipo: TipoMarco.CHECKLIST,
          descricao: 'Delimitar o escopo e planejar as datas das entregas principais do projeto.',
          dataPrevista: new Date(hoje.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 dias
          status: StatusMarco.A_FAZER,
          responsavelId: orientandoId,
        },
        {
          projetoId,
          titulo: 'Exame de Qualificação do Projeto',
          tipo: TipoMarco.QUALIFICACAO,
          descricao: 'Apresentação formal da proposta de pesquisa para a banca avaliadora.',
          dataPrevista: dataQualificacao,
          status: StatusMarco.A_FAZER,
          responsavelId: orientandoId,
        },
        {
          projetoId,
          titulo: 'Defesa Final da Pesquisa',
          tipo: TipoMarco.DEFESA,
          descricao: 'Defesa pública do trabalho final de conclusão ou dissertação/tese.',
          dataPrevista: dataDefesa,
          status: StatusMarco.A_FAZER,
          responsavelId: orientandoId,
        },
      ],
    });

    revalidatePath('/orientador');
    revalidatePath(`/orientador/alunos/${orientandoId}`);
    revalidatePath('/aluno');
  } catch (error) {
    console.error('Erro ao aprovar projeto:', error);
  }
}

export async function liberarParecer(parecerId: string, documentoId: string) {
  try {
    const { prisma } = await import('@/lib/db');

    const parecer = await prisma.parecerLLM.findUnique({
      where: { id: parecerId },
      include: {
        documento: {
          include: {
            projeto: true
          }
        }
      }
    });

    if (parecer) {
      await prisma.parecerLLM.update({
        where: { id: parecerId },
        data: { parecerLiberado: true },
      });

      const { criarNotificacao } = await import('@/lib/notifications');
      await criarNotificacao(
        parecer.documento.projeto.orientandoId,
        'Novo Parecer de IA Liberado',
        `Seu orientador liberou a análise de IA para o manuscrito "${parecer.documento.titulo}".`
      );
    }

    revalidatePath(`/orientador/reunioes/${documentoId}/parecer`);
    revalidatePath('/aluno/documentos');
  } catch (error) {
    console.error('Erro ao liberar parecer:', error);
    return;
  }
  redirect(`/orientador/reunioes/${documentoId}/parecer`);
}

export async function salvarDisponibilidade(orientadorId: string, formData: FormData) {
  try {
    const { prisma } = await import('@/lib/db');
    
    const diaSemana = parseInt(formData.get('diaSemana') as string);
    const horaInicio = formData.get('horaInicio') as string;
    const horaFim = formData.get('horaFim') as string;

    await prisma.disponibilidadeOrientador.upsert({
      where: {
        orientadorId_diaSemana_horaInicio: {
          orientadorId,
          diaSemana,
          horaInicio
        }
      },
      update: { horaFim },
      create: {
        orientadorId,
        diaSemana,
        horaInicio,
        horaFim
      }
    });

    revalidatePath('/orientador/agenda');
  } catch (error) {
    console.error('Erro ao salvar disponibilidade:', error);
  }
}

export async function removerDisponibilidade(id: string) {
  try {
    const { prisma } = await import('@/lib/db');
    await prisma.disponibilidadeOrientador.delete({
      where: { id }
    });
    revalidatePath('/orientador/agenda');
  } catch (error) {
    console.error('Erro ao remover disponibilidade:', error);
  }
}

export async function agendarReuniao(orientandoId: string, formData: FormData) {
  let papelUsuario = '';
  try {
    const { prisma } = await import('@/lib/db');
    const { getServerSession } = await import('next-auth/next');
    const { authOptions } = await import('@/lib/auth');

    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Não autorizado.');
    }
    papelUsuario = session.user.papel;

    // 1. Obter o projeto e orientador/orientando
    const projeto = await prisma.projetoOrientacao.findFirst({
      where: { orientandoId },
      include: { orientador: true, orientando: true }
    });

    if (!projeto) {
      throw new Error('Projeto de orientação não encontrado.');
    }

    const valorCombinado = formData.get('horarioCombinado') as string;
    if (!valorCombinado) {
      throw new Error('Nenhum horário selecionado.');
    }
    const [dataInput, slotId] = valorCombinado.split('_');
    const objetivo = formData.get('objetivo') as string || '';
    const solicitadoPor = session.user.papel;

    const slot = await prisma.disponibilidadeOrientador.findUnique({
      where: { id: slotId }
    });

    if (!slot) {
      throw new Error('Slot de disponibilidade inválido.');
    }

    // 2. Montar data e hora de início e término
    const dataHoraInicio = new Date(`${dataInput}T${slot.horaInicio}:00`);
    const dataHoraFim = new Date(`${dataInput}T${slot.horaFim}:00`);

    // Validar se o dia da semana da data bate com o do slot
    if (dataHoraInicio.getDay() !== slot.diaSemana) {
      throw new Error('O dia da semana da data escolhida não corresponde ao dia da semana do horário disponível.');
    }

    // Validar se a data escolhida é futura
    if (dataHoraInicio < new Date()) {
      throw new Error('Você não pode agendar uma reunião no passado.');
    }

    // 3. Prevenção de Choque de Horários (Conflitos)
    const conflito = await prisma.reuniao.findFirst({
      where: {
        projeto: { orientadorId: projeto.orientadorId },
        dataHoraInicio
      }
    });

    if (conflito) {
      throw new Error('O orientador já tem uma reunião agendada para este mesmo dia e horário. Escolha outro slot.');
    }

    // 4. Contar encontros para definir o número do encontro
    const totalEncontros = await prisma.reuniao.count({
      where: { projetoId: projeto.id }
    });

    // 5. Link Google Meet Fixo do Projeto
    const linkVideoconferencia = projeto.linkMeetFixo || 'https://meet.google.com/fxv-mbbh-rqj';

    await prisma.reuniao.create({
      data: {
        projetoId: projeto.id,
        numeroEncontro: totalEncontros + 1,
        dataHoraInicio,
        dataHoraFim,
        linkVideoconferencia,
        situacaoCronograma: 'VERDE',
        sinteseAvanco: [],
        decisoes: [],
        riscos: [],
        planoTrabalho: [],
        perguntasProximaEntrega: [],
        proximoEncontro: {},
        participantes: [projeto.orientador.nome, projeto.orientando.nome],
        objetivo,
        solicitadoPor
      }
    });

    // 6. Notificar Aluno e Orientador por e-mail via Resend
    const { enviarEmailReservaReuniao } = await import('@/lib/mail');
    await enviarEmailReservaReuniao({
      emailAluno: projeto.orientando.email,
      emailOrientador: projeto.orientador.email,
      nomeAluno: projeto.orientando.nome,
      nomeOrientador: projeto.orientador.nome,
      dataHora: dataHoraInicio.toLocaleString('pt-BR'),
      objetivo,
      linkMeet: linkVideoconferencia,
      acao: 'AGENDAMENTO'
    });

    revalidatePath('/aluno/reunioes');
    revalidatePath('/orientador/agenda');
    revalidatePath(`/orientador/alunos/${orientandoId}`);
  } catch (error: any) {
    console.error('Erro ao agendar reunião:', error);
    throw error;
  }

  if (papelUsuario === 'ORIENTADOR') {
    redirect(`/orientador/alunos/${orientandoId}`);
  } else {
    redirect('/aluno/reunioes');
  }
}

export async function reagendarReuniao(reuniaoId: string, formData: FormData) {
  let papelUsuario = '';
  let orientandoId = '';
  try {
    const { prisma } = await import('@/lib/db');
    const { getServerSession } = await import('next-auth/next');
    const { authOptions } = await import('@/lib/auth');

    const session = await getServerSession(authOptions);
    if (!session) {
      throw new Error('Não autorizado.');
    }
    papelUsuario = session.user.papel;

    // Buscar a reunião existente
    const reuniao = await prisma.reuniao.findUnique({
      where: { id: reuniaoId },
      include: {
        projeto: {
          include: { orientador: true, orientando: true }
        }
      }
    });

    if (!reuniao) {
      throw new Error('Reunião não encontrada.');
    }
    orientandoId = reuniao.projeto.orientandoId;

    const valorCombinado = formData.get('horarioCombinado') as string;
    if (!valorCombinado) {
      throw new Error('Nenhum horário selecionado.');
    }
    const [dataInput, slotId] = valorCombinado.split('_');

    const slot = await prisma.disponibilidadeOrientador.findUnique({
      where: { id: slotId }
    });

    if (!slot) {
      throw new Error('Slot de disponibilidade inválido.');
    }

    // Montar nova data e hora
    const dataHoraInicio = new Date(`${dataInput}T${slot.horaInicio}:00`);
    const dataHoraFim = new Date(`${dataInput}T${slot.horaFim}:00`);

    // Validar se o dia da semana bate com o slot
    if (dataHoraInicio.getDay() !== slot.diaSemana) {
      throw new Error('O dia da semana da data escolhida não corresponde ao dia da semana do horário disponível.');
    }

    if (dataHoraInicio < new Date()) {
      throw new Error('Você não pode reagendar para uma data passada.');
    }

    // Prevenção de conflito de horários (excluindo a própria reunião sendo reagendada!)
    const conflito = await prisma.reuniao.findFirst({
      where: {
        id: { not: reuniaoId },
        projeto: { orientadorId: reuniao.projeto.orientadorId },
        dataHoraInicio
      }
    });

    if (conflito) {
      throw new Error('O orientador já tem outra reunião marcada para esta data/horário.');
    }

    // Atualizar a reunião
    await prisma.reuniao.update({
      where: { id: reuniaoId },
      data: {
        dataHoraInicio,
        dataHoraFim
      }
    });

    // Enviar e-mail de aviso
    const { enviarEmailReservaReuniao } = await import('@/lib/mail');
    await enviarEmailReservaReuniao({
      emailAluno: reuniao.projeto.orientando.email,
      emailOrientador: reuniao.projeto.orientador.email,
      nomeAluno: reuniao.projeto.orientando.nome,
      nomeOrientador: reuniao.projeto.orientador.nome,
      dataHora: dataHoraInicio.toLocaleString('pt-BR'),
      objetivo: reuniao.objetivo || 'Reagendamento de orientação',
      linkMeet: reuniao.linkVideoconferencia || reuniao.projeto.linkMeetFixo,
      acao: 'REAGENDAMENTO'
    });

    revalidatePath('/aluno/reunioes');
    revalidatePath('/orientador/agenda');
    revalidatePath(`/orientador/alunos/${orientandoId}`);
  } catch (error) {
    console.error('Erro ao reagendar reunião:', error);
    throw error;
  }

  if (papelUsuario === 'ORIENTADOR') {
    redirect(`/orientador/alunos/${orientandoId}`);
  } else {
    redirect('/aluno/reunioes');
  }
}

export async function submeterSecao(projetoId: string, formData: FormData) {
  try {
    const { prisma } = await import('@/lib/db');
    
    const titulo = formData.get('titulo') as string;
    const conteudo = formData.get('conteudo') as string;

    const oQueProduzi = formData.get('oQueProduzi') as string || null;
    const oQueMudou = formData.get('oQueMudou') as string || null;
    const ondeTenhoDuvida = formData.get('ondeTenhoDuvida') as string || null;
    const oQuePrecisoAvancar = formData.get('oQuePrecisoAvancar') as string || null;

    if (!titulo || !conteudo) {
      throw new Error('Título e conteúdo são obrigatórios.');
    }

    const projeto = await prisma.projetoOrientacao.findUnique({
      where: { id: projetoId },
      include: { orientando: true, orientador: true }
    });

    if (!projeto) {
      throw new Error('Projeto de orientação não encontrado.');
    }

    // Criar ou atualizar seção de texto (versão)
    const secaoExistente = await prisma.secaoTexto.findFirst({
      where: { projetoId, titulo }
    });

    const novaVersao = secaoExistente ? secaoExistente.versao + 1 : 1;

    if (secaoExistente) {
      // 1. Gravar a versão anterior no histórico de versões
      await prisma.versaoSecaoTexto.create({
        data: {
          secaoId: secaoExistente.id,
          versao: secaoExistente.versao,
          conteudo: secaoExistente.conteudo,
          autorPapel: 'ORIENTANDO',
          correcoes: secaoExistente.correcoes,
          parecerIA: secaoExistente.parecerIA
        }
      });

      // 2. Chamar IA se existiam correções (pedidos do professor) na versão anterior
      let parecerIA = secaoExistente.parecerIA || null;
      if (secaoExistente.correcoes) {
        const { analisarRevisaoTexto } = await import('@/lib/gemini');
        parecerIA = await analisarRevisaoTexto(
          secaoExistente.conteudo,
          secaoExistente.correcoes,
          conteudo
        );
      }

      // 3. Atualizar a seção com nova versão e parecer comparativo
      await prisma.secaoTexto.update({
        where: { id: secaoExistente.id },
        data: {
          conteudo,
          status: 'PENDENTE',
          versao: novaVersao,
          parecerIA,
          oQueProduzi,
          oQueMudou,
          ondeTenhoDuvida,
          oQuePrecisoAvancar
        }
      });
    } else {
      await prisma.secaoTexto.create({
        data: {
          projetoId,
          titulo,
          conteudo,
          status: 'PENDENTE',
          versao: 1,
          oQueProduzi,
          oQueMudou,
          ondeTenhoDuvida,
          oQuePrecisoAvancar
        }
      });
    }

    // 4. Criar Notificação no Portal para o Orientador
    const { criarNotificacao } = await import('@/lib/notifications');
    await criarNotificacao(
      projeto.orientadorId,
      'Novo Capítulo para Revisão',
      `O aluno ${projeto.orientando.nome} submeteu a versão v${novaVersao} do capítulo "${titulo}".`
    );

    revalidatePath('/aluno/redacao');
    revalidatePath(`/orientador/alunos/${projeto.orientandoId}/redacao`);

    // Notificar Orientador por e-mail via Resend (Simulado/Real)
    try {
      console.log(`[E-mail Notificação] Aluno ${projeto.orientando.nome} submeteu/atualizou a seção "${titulo}". Enviando e-mail para ${projeto.orientador.email}...`);
    } catch (e) {
      console.error('Erro ao enviar e-mail de notificação de seção:', e);
    }

  } catch (error) {
    console.error('Erro ao submeter seção:', error);
  }
}

export async function revisarSecao(secaoId: string, status: 'APROVADO' | 'REVISAR', formData: FormData) {
  let orientandoId = '';
  try {
    const { prisma } = await import('@/lib/db');
    
    const correcoes = formData.get('correcoes') as string;
    const notaPertinencia = parseInt(formData.get('notaPertinencia') as string || '0');
    const notaCoerencia = parseInt(formData.get('notaCoerencia') as string || '0');
    const notaEvidencia = parseInt(formData.get('notaEvidencia') as string || '0');
    const notaClareza = parseInt(formData.get('notaClareza') as string || '0');
    const notaConformidade = parseInt(formData.get('notaConformidade') as string || '0');

    // Hard-gate da Rubrica 5D: aprovação exige nota >= 2 em todas as dimensões
    let statusFinal = status;
    let correcoesFinais = correcoes;

    if (status === 'APROVADO') {
      const temNotaBaixa = 
        notaPertinencia < 2 || 
        notaCoerencia < 2 || 
        notaEvidencia < 2 || 
        notaClareza < 2 || 
        notaConformidade < 2;

      if (temNotaBaixa) {
        statusFinal = 'REVISAR';
        const avisoRubrica = `[REBAIXADO AUTOMATICAMENTE: Notas da Rubrica 5D inferiores a 2/3 exigem revisão científica obrigatória.]\n\n`;
        correcoesFinais = avisoRubrica + (correcoes || '');
      }
    }

    const secao = await prisma.secaoTexto.update({
      where: { id: secaoId },
      data: {
        status: statusFinal as any,
        correcoes: correcoesFinais,
        notaPertinencia,
        notaCoerencia,
        notaEvidencia,
        notaClareza,
        notaConformidade
      },
      include: {
        projeto: {
          include: { orientando: true, orientador: true }
        }
      }
    });
    orientandoId = secao.projeto.orientandoId;

    // Criar Notificação no Portal para o Aluno
    const { criarNotificacao } = await import('@/lib/notifications');
    await criarNotificacao(
      orientandoId,
      'Capítulo Avaliado',
      `Seu orientador avaliou o capítulo "${secao.titulo}" como ${statusFinal === 'APROVADO' ? 'Aprovado' : 'Revisar'}.`
    );

    revalidatePath('/aluno/redacao');
    revalidatePath(`/orientador/alunos/${orientandoId}/redacao`);

    // Notificar Aluno por e-mail via Resend (Simulado/Real)
    try {
      console.log(`[E-mail Notificação] Orientador ${secao.projeto.orientador.nome} atualizou status da seção "${secao.titulo}" para ${statusFinal}. Enviando e-mail para ${secao.projeto.orientando.email}...`);
    } catch (e) {
      console.error('Erro ao enviar e-mail de notificação de revisão:', e);
    }

  } catch (error) {
    console.error('Erro ao revisar seção:', error);
    return;
  }

  if (orientandoId) {
    redirect(`/orientador/alunos/${orientandoId}/redacao`);
  }
}

export async function submeterReplicaOrientador(secaoId: string, formData: FormData) {
  let orientandoId = '';
  try {
    const { prisma } = await import('@/lib/db');
    
    const conteudoReplica = formData.get('conteudoReplica') as string;
    if (!conteudoReplica) {
      throw new Error('Conteúdo da réplica é obrigatório.');
    }

    const secao = await prisma.secaoTexto.findUnique({
      where: { id: secaoId },
      include: {
        projeto: {
          include: { orientando: true, orientador: true }
        }
      }
    });

    if (!secao) {
      throw new Error('Seção não encontrada.');
    }
    orientandoId = secao.projeto.orientandoId;

    // 1. Gravar a versão anterior no histórico de versões
    await prisma.versaoSecaoTexto.create({
      data: {
        secaoId: secao.id,
        versao: secao.versao,
        conteudo: secao.conteudo,
        autorPapel: 'ORIENTANDO',
        correcoes: secao.correcoes,
        parecerIA: secao.parecerIA
      }
    });

    // 2. Atualizar a seção com a réplica do professor e status REVISAR
    await prisma.secaoTexto.update({
      where: { id: secaoId },
      data: {
        conteudo: conteudoReplica,
        status: 'REVISAR',
        versao: secao.versao + 1,
        correcoes: 'Réplica de texto revisada pelo Orientador.'
      }
    });

    // 3. Criar Notificação no Portal para o Aluno
    const { criarNotificacao } = await import('@/lib/notifications');
    await criarNotificacao(
      orientandoId,
      'Nova Réplica Corrigida',
      `Seu orientador submeteu uma réplica corrigida do texto para o capítulo "${secao.titulo}".`
    );

    revalidatePath('/aluno/redacao');
    revalidatePath(`/orientador/alunos/${orientandoId}/redacao`);

  } catch (error) {
    console.error('Erro ao submeter réplica do orientador:', error);
    return;
  }

  if (orientandoId) {
    redirect(`/orientador/alunos/${orientandoId}/redacao`);
  }
}

export async function marcarNotificacaoLida(notificacaoId: string) {
  try {
    const { prisma } = await import('@/lib/db');
    await prisma.notificacao.update({
      where: { id: notificacaoId },
      data: { lida: true }
    });
    revalidatePath('/aluno');
    revalidatePath('/orientador');
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
  }
}

export async function salvarConfigAgendaAutomatica(orientadorId: string, formData: FormData) {
  try {
    const { prisma } = await import('@/lib/db');
    
    const frequencia = formData.get('frequencia') as string; // "QUINZENAL" ou "MENSAL"
    const diaSemana = parseInt(formData.get('diaSemana') as string); // 0 a 6
    const hora = formData.get('hora') as string; // ex: "14:00"
    const ativo = formData.get('ativo') === 'true';

    // 1. Salvar ou atualizar configuração
    const configExistente = await prisma.configAgendaAutomatica.findFirst({
      where: { orientadorId }
    });

    if (configExistente) {
      await prisma.configAgendaAutomatica.update({
        where: { id: configExistente.id },
        data: { frequencia, diaSemana, hora, ativo }
      });
    } else {
      await prisma.configAgendaAutomatica.create({
        data: { orientadorId, frequencia, diaSemana, hora, ativo }
      });
    }

    // 2. Se ativa, gerar agendamentos automáticos para os alunos orientados
    if (ativo) {
      const projetos = await prisma.projetoOrientacao.findMany({
        where: { orientadorId },
        include: { orientando: true, orientador: true }
      });

      const hoje = new Date();

      for (const projeto of projetos) {
        // Encontrar as datas para os próximos 30 dias que coincidem com diaSemana e hora
        const datasGerar: Date[] = [];
        let dataFoco = new Date();
        
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date();
          checkDate.setDate(hoje.getDate() + i);
          
          if (checkDate.getDay() === diaSemana) {
            const dataReuniao = new Date(checkDate);
            dataReuniao.setHours(parseInt(hora.split(':')[0]), parseInt(hora.split(':')[1]), 0, 0);

            if (dataReuniao > hoje) {
              datasGerar.push(dataReuniao);
            }
          }
        }

        // Se quinzenal, pegamos até 2 datas (uma a cada 15 dias aprox)
        // Se mensal, pegamos apenas 1 data
        const datasFiltradas = frequencia === 'QUINZENAL' 
          ? datasGerar.slice(0, 2) 
          : datasGerar.slice(0, 1);

        for (const dataHoraInicio of datasFiltradas) {
          const dataHoraFim = new Date(dataHoraInicio);
          dataHoraFim.setHours(dataHoraInicio.getHours() + 1);

          // Verificar conflito
          const conflito = await prisma.reuniao.findFirst({
            where: {
              projetoId: projeto.id,
              dataHoraInicio
            }
          });

          if (!conflito) {
            const totalEncontros = await prisma.reuniao.count({
              where: { projetoId: projeto.id }
            });

            const linkMeet = projeto.linkMeetFixo || 'https://meet.google.com/fxv-mbbh-rqj';

            // Criar reunião
            await prisma.reuniao.create({
              data: {
                projetoId: projeto.id,
                numeroEncontro: totalEncontros + 1,
                dataHoraInicio,
                dataHoraFim,
                linkVideoconferencia: linkMeet,
                situacaoCronograma: 'VERDE',
                sinteseAvanco: [],
                decisoes: [],
                riscos: [],
                planoTrabalho: [],
                perguntasProximaEntrega: [],
                proximoEncontro: {},
                participantes: [projeto.orientador.nome, projeto.orientando.nome],
                objetivo: 'Reunião de Orientação Automática Periódica',
                solicitadoPor: 'ORIENTADOR'
              }
            });

            // Disparar notificações no portal
            const { criarNotificacao } = await import('@/lib/notifications');
            await criarNotificacao(
              projeto.orientandoId,
              'Reunião Periódica Agendada',
              `O sistema SOAI agendou automaticamente seu encontro periódico quinzenal para ${dataHoraInicio.toLocaleString('pt-BR')}.`
            );

            // Disparar e-mail
            const { enviarEmailReservaReuniao } = await import('@/lib/mail');
            await enviarEmailReservaReuniao({
              emailAluno: projeto.orientando.email,
              emailOrientador: projeto.orientador.email,
              nomeAluno: projeto.orientando.nome,
              nomeOrientador: projeto.orientador.nome,
              dataHora: dataHoraInicio.toLocaleString('pt-BR'),
              objetivo: 'Reunião de Orientação Automática Periódica',
              linkMeet,
              acao: 'AGENDAMENTO'
            });
          }
        }
      }
    }

    revalidatePath('/orientador/agenda');
    revalidatePath('/aluno/reunioes');
  } catch (error) {
    console.error('Erro ao salvar configuração de agenda automática:', error);
  }
}

export async function salvarPrazoDefesa(projetoId: string, dataPrazoStr: string) {
  try {
    const { prisma } = await import('@/lib/db');
    
    const prazoDefesa = dataPrazoStr ? new Date(dataPrazoStr) : null;

    await prisma.projetoOrientacao.update({
      where: { id: projetoId },
      data: { prazoDefesa }
    });

    revalidatePath(`/orientador/alunos/${projetoId}`);
    revalidatePath('/aluno');
  } catch (error) {
    console.error('Erro ao salvar prazo de defesa:', error);
  }
}

export async function adicionarLeituraIndicada(projetoId: string, formData: FormData) {
  let orientandoId = '';
  try {
    const { prisma } = await import('@/lib/db');

    const titulo = formData.get('titulo') as string;
    const autor = formData.get('autor') as string;
    const link = formData.get('link') as string;
    const observacao = formData.get('observacao') as string;

    if (!titulo) {
      throw new Error('O título é obrigatório.');
    }

    const projeto = await prisma.projetoOrientacao.findUnique({
      where: { id: projetoId }
    });

    if (!projeto) {
      throw new Error('Projeto não encontrado.');
    }
    orientandoId = projeto.orientandoId;

    await prisma.bibliotecaLeitura.create({
      data: {
        projetoId,
        titulo,
        autor,
        link,
        observacao
      }
    });

    // Notificar aluno
    const { criarNotificacao } = await import('@/lib/notifications');
    await criarNotificacao(
      orientandoId,
      'Nova Indicação de Leitura',
      `Seu orientador indicou a leitura: "${titulo}". Acesse na sua Biblioteca.`
    );

    revalidatePath(`/orientador/alunos/${projetoId}/biblioteca`);
    revalidatePath('/aluno/biblioteca');
  } catch (error) {
    console.error('Erro ao adicionar leitura indicada:', error);
  }
}

export async function removerLeituraIndicada(leituraId: string, projetoId: string) {
  try {
    const { prisma } = await import('@/lib/db');

    await prisma.bibliotecaLeitura.delete({
      where: { id: leituraId }
    });

    revalidatePath(`/orientador/alunos/${projetoId}/biblioteca`);
    revalidatePath('/aluno/biblioteca');
  } catch (error) {
    console.error('Erro ao remover leitura indicada:', error);
  }
}

export async function agendarReuniaoLivre(projetoId: string, formData: FormData) {
  let orientandoId = '';
  try {
    const { prisma } = await import('@/lib/db');

    const dataStr = formData.get('data') as string; // ex: "2026-08-25"
    const horaStr = formData.get('hora') as string; // ex: "15:00"
    const objetivo = formData.get('objetivo') as string || 'Reunião de orientação livre';

    if (!dataStr || !horaStr) {
      throw new Error('Data e horário são obrigatórios.');
    }

    const projeto = await prisma.projetoOrientacao.findUnique({
      where: { id: projetoId },
      include: { orientando: true, orientador: true }
    });

    if (!projeto) {
      throw new Error('Projeto não encontrado.');
    }
    orientandoId = projeto.orientandoId;

    // Calcular dataHoraInicio e dataHoraFim (1 hora de duração padrão)
    const dataHoraInicio = new Date(`${dataStr}T${horaStr}:00`);
    const dataHoraFim = new Date(dataHoraInicio);
    dataHoraFim.setHours(dataHoraInicio.getHours() + 1);

    if (dataHoraInicio < new Date()) {
      throw new Error('Você não pode agendar compromissos para datas passadas.');
    }

    const totalEncontros = await prisma.reuniao.count({
      where: { projetoId }
    });

    const linkVideoconferencia = projeto.linkMeetFixo || 'https://meet.google.com/fxv-mbbh-rqj';

    await prisma.reuniao.create({
      data: {
        projetoId,
        numeroEncontro: totalEncontros + 1,
        dataHoraInicio,
        dataHoraFim,
        linkVideoconferencia,
        situacaoCronograma: 'VERDE',
        sinteseAvanco: [],
        decisoes: [],
        riscos: [],
        planoTrabalho: [],
        perguntasProximaEntrega: [],
        proximoEncontro: {},
        participantes: [projeto.orientador.nome, projeto.orientando.nome],
        objetivo,
        solicitadoPor: 'ORIENTADOR'
      }
    });

    // Notificar aluno
    const { criarNotificacao } = await import('@/lib/notifications');
    await criarNotificacao(
      orientandoId,
      'Novo Encontro Agendado',
      `Seu orientador agendou uma reunião para o dia ${dataHoraInicio.toLocaleString('pt-BR')}.`
    );

    // Enviar e-mail de reserva
    const { enviarEmailReservaReuniao } = await import('@/lib/mail');
    await enviarEmailReservaReuniao({
      emailAluno: projeto.orientando.email,
      emailOrientador: projeto.orientador.email,
      nomeAluno: projeto.orientando.nome,
      nomeOrientador: projeto.orientador.nome,
      dataHora: dataHoraInicio.toLocaleString('pt-BR'),
      objetivo,
      linkMeet: linkVideoconferencia,
      acao: 'AGENDAMENTO'
    });

    revalidatePath(`/orientador/alunos/${projetoId}`);
    revalidatePath('/aluno/reunioes');
  } catch (error) {
    console.error('Erro ao agendar reunião livre:', error);
  }
}

export async function executarAuditoriaIA(secaoId: string) {
  let orientandoId = '';
  try {
    const { prisma } = await import('@/lib/db');
    
    const secao = await prisma.secaoTexto.findUnique({
      where: { id: secaoId },
      include: {
        projeto: true
      }
    });

    if (!secao) {
      throw new Error('Seção de texto não encontrada.');
    }
    orientandoId = secao.projeto.orientandoId;

    const { auditarTextoIA } = await import('@/lib/gemini');
    const result = await auditarTextoIA(secao.conteudo);

    await prisma.auditoriaIA.create({
      data: {
        secaoTextoId: secaoId,
        classificacao: result.classificacao,
        confianca: result.confianca,
        justificativa: result.justificativa,
        pontuacao: result.pontuacao
      }
    });

    revalidatePath('/aluno/redacao');
    revalidatePath(`/orientador/alunos/${orientandoId}/redacao`);

  } catch (error) {
    console.error('Erro ao executar auditoria de IA:', error);
    return;
  }

  if (orientandoId) {
    redirect(`/orientador/alunos/${orientandoId}/redacao`);
  }
}
