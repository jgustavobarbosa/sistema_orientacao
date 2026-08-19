# SOIA UI/UX Blueprint — Guia Técnico de Design

Este documento serve como referência arquitetural de interface e design visual para novos sistemas SaaS baseados na estética premium do **SOIA (Sistema de Orientação Acadêmica Inteligente)**. Ele detalha as decisões estéticas, tokens de estilo, micro-interações e layouts aplicados na Landpage, Login, Perfis e Painéis Administrativos.

---

## 🎨 1. Estética Base & Tokens do Design System

A interface do SOIA adota uma direção visual híbrida entre a sofisticação sombria do **Linear** e a fluidez do **Arc Browser**, baseada em **Glassmorphism**, contrastes profundos de cores escuras e acentos de cores brilhantes.

### Paleta de Cores (Tokens HSL/Hex)
*   **Fundo da Aplicação (`bg-app`)**: `#02040a` (Profundidade escura infinita).
*   **Vidro Fosco (`bg-glass`)**: `rgba(10, 15, 30, 0.45)` com `backdrop-filter: blur(20px)`.
*   **Acento Primário (`accent-indigo`)**: `#4f46e5` (Para links ativos, botões principais de ação e estados de foco).
*   **Acento de Sucesso (`accent-emerald`)**: `#10b981` (Para aprovações, gates resolvidos e status de prontidão).
*   **Acento de Alerta (`accent-amber`)**: `#f59e0b` (Para itens sob revisão ou seções em atraso).
*   **Borda Fina (`border-glow`)**: `1px solid rgba(255, 255, 255, 0.045)`.

### Efeitos de Hover e Foco
*   **Inputs e Selects**: Ao receber foco, o elemento aplica um anel luminoso azul/índigo (`box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2)`) e acende a borda em `#6366f1`.
*   **Botões**: Ao clicar, aplicam redução mecânica de tamanho (`scale: 0.98`) com transição rápida de 100ms.

---

## 🧭 2. Arquitetura das Telas Chave

```
   ┌─────────────────────────────────────────────────────────────┐
   │ [SOIA LOGO]                  Landpage                      │
   │                                                             │
   │           ┌─────────────────────────────────────┐           │
   │           │       Abertura Animada (S - SVG)    │           │
   │           └─────────────────────────────────────┘           │
   │                                                             │
   │    ┌─────────────────┐ ┌─────────────────┐ ┌───────────┐    │
   │    │ Estatísticas    │ │ Ficha Técnica   │ │ Entrar    │    │
   │    └─────────────────┘ └─────────────────┘ └───────────┘    │
   └─────────────────────────────────────────────────────────────┘
```

### 2.1 Landpage & Abertura Animada (`soia-opening.html`)
*   **Identidade Visual (Logotipo SVG)**:
    A animação é inteiramente baseada em código SVG nativo para carregamento instantâneo. A marca "S" é desenhada em três movimentos sincronizados:
    1.  *0.0s – 0.85s*: A curva superior desenha o primeiro arco do "S" com `stroke-dasharray` e `stroke-dashoffset`.
    2.  *0.38s – 1.23s*: A curva inferior completa o desenho em sentido oposto.
    3.  *0.80s – 1.30s*: Os arcos de convergência interna se encontram no núcleo.
    4.  *1.10s – 1.65s*: O núcleo central ativa com um único pulso controlado de escala (`scale(1.15)`) e opacidade.
*   **Transição de Abertura**:
    Após a conclusão da animação da marca, a interface realiza um fade-in translúcido com deslocamento de `8px` vertical para revelar as estatísticas e botões de chamada à ação.

### 2.2 Tela de Login, Senha e Cadastro
*   **Layout Centralizado**:
    O formulário é inserido em um container rígido de `420px` com cantos arredondados (`rounded-3xl`), centralizado na tela. O fundo é decorado por dois orbes de gradiente radial neon azul e rosa desfocados a 120px que se movimentam suavemente em segundo plano.
*   **Formulários Reativos**:
    Os inputs utilizam labels flutuantes de tamanho reduzido (`text-[10px]`) e tipografia mono para campos de código de ativação. Badges discretos indicam se a validação passou.

### 2.3 Perfis de Usuário e Área Administrativa (Orientador)
*   **Sidebar Retrátil**:
    A navegação lateral colapsa de `256px` para `80px` com transição baseada em `cubic-bezier(0.4, 0, 0.2, 1)`.
    - *Modo Expandido*: Exibe a logo compacta + nome do menu.
    - *Modo Compacto*: Exibe apenas o símbolo SVG com fundo transparente.
*   **Painel do Orientador (Split View)**:
    A página de acompanhamento do aluno se divide em:
    - **Área Principal**: Timeline vertical conectada por uma linha pontilhada (`border-l border-dashed border-slate-800`). Cada nó (etapa) contém seções que se expandem para exibir a rubrica e o formulário de decisão do gate de etapa.
    - **Sidebar do Escopo**: Card fixo à direita contendo a Ficha Inicial consolidada de onboarding e ações de agendamento de reuniões rápidas.

### 2.4 Perfil do Aluno e Dossiê Acadêmico
*   **Manifesto de Dossiê**:
    Tabela ou grid de cards translúcidos apresentando todas as seções do modelo de escrita. As aprovadas aparecem expandidas com o conteúdo final formatado em tipografia mono. As ausentes/pendentes aparecem semitransparentes com etiquetas "Pendente" ou "Revisar".
*   **Trava de Prontidão**:
    Um banner visual de cabeçalho na cor vermelha lista explicitamente quais seções obrigatórias impedem o aluno de solicitar a defesa de tese. Quando resolvido, o banner transiciona suavemente para a cor verde esmeralda brilhante.
