# Kit de identidade e abertura — SOIA

## Arquivos

- `soia-logo-dark.svg`: logotipo horizontal para fundos azul-marinho/escuros.
- `soia-logo-light.svg`: logotipo horizontal para fundos brancos ou claros.
- `soia-logo-compact.svg`: símbolo + SOIA para barra superior e sidebar expandida.
- `soia-icon.svg`: símbolo isolado com fundo transparente; use em sidebar recolhida e favicon.
- `soia-app-icon.svg`: ícone com tile azul-marinho; use em login, atalho e avatar do produto.
- `soia-opening.html`: demonstração completa da abertura animada, responsiva e sem dependências.
- `png/`: versões rasterizadas para contextos que não aceitam SVG.

## Sequência da animação

1. **0–0,85 s:** a rota superior desenha o primeiro movimento do “S”.
2. **0,38–1,23 s:** a rota inferior completa o percurso.
3. **0,80–1,30 s:** os arcos internos convergem para o núcleo.
4. **1,10–1,65 s:** o núcleo ativa com um único pulso controlado.
5. **1,35–2,30 s:** entram o nome SOIA e a assinatura.
6. **3,20 s:** a camada de abertura desaparece e revela a landing page.

## Integração recomendada

Copie o bloco `.soia-intro` do HTML para o componente raiz da landing page e mantenha o conteúdo real abaixo dele. Copie o CSS correspondente para a folha global e o pequeno script para o ciclo de montagem do componente.

No sistema autenticado, não repita a abertura a cada navegação. Exiba-a apenas:

- na primeira visita à landing page;
- após login, no máximo uma vez por sessão;
- quando o usuário acionar “Rever abertura”.

Para controlar por sessão:

```js
const alreadySeen = sessionStorage.getItem('soia-intro-seen');
if (alreadySeen) closeIntroImmediately();
else {
  playIntro();
  sessionStorage.setItem('soia-intro-seen', '1');
}
```

## Regras importantes

- Preserve a grafia **SOIA** em todas as telas.
- Não use a assinatura completa quando a largura disponível for menor que 460 px; use a versão compacta.
- Altura mínima do logotipo no cabeçalho: 32 px.
- Área de proteção: pelo menos a largura do núcleo central em todos os lados.
- A animação respeita `prefers-reduced-motion`; nesse modo, a marca aparece estática.
- Evite loop infinito, brilhos intensos e pulsação permanente.

## Prompt para orientar outra IA no projeto

> Implemente a abertura SOIA usando o arquivo `soia-opening.html` como referência autoritativa. Preserve rigorosamente o desenho, as cores, os tempos e a grafia SOIA. Transforme o HTML em componentes compatíveis com o framework atual, sem alterar a landing page existente. A animação deve executar por 3,2 segundos apenas na primeira visita da sessão, permitir “Pular abertura”, terminar sem salto de layout e liberar imediatamente a interação da página. Ao final, mantenha a marca compacta no cabeçalho. Implemente `prefers-reduced-motion`, pause animações quando a aba não estiver visível e garanta ausência de overflow horizontal nos breakpoints 360, 390, 768, 1366 e 1440 px. Não use vídeo, canvas, bibliotecas externas, glow intenso nem loop permanente. Entregue testes para duração, encerramento, sessão, botão de pular e reduced motion.
