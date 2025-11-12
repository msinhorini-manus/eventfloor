# Portal ERP - Gestão de Plantas de Eventos - TODO

## Fase 1: Configuração Inicial e Banco de Dados
- [x] Criar schema de banco de dados (events, exhibitors, admin_users)
- [x] Configurar autenticação para admins
- [x] Criar estrutura de rotas (admin e public)

## Fase 2: Área Administrativa
- [ ] Dashboard admin com lista de eventos
- [ ] CRUD de eventos (criar, editar, listar, deletar)
- [ ] Upload de imagem da planta do evento
- [ ] Interface para adicionar expositores
- [ ] Sistema de marcação de posição dos expositores na planta (clique na imagem)
- [ ] Upload de logos dos expositores
- [ ] Gestão de categorias de expositores
- [ ] Preview da visualização pública

## Fase 3: Visualização Pública
- [ ] Página pública do evento com planta interativa
- [ ] Lista lateral de expositores com busca
- [ ] Zoom e pan na planta
- [ ] Clique em expositor → destaca na planta
- [ ] Clique na planta → mostra info do expositor
- [ ] Responsividade mobile
- [ ] Compartilhamento via URL

## Fase 4: Testes e Documentação
- [ ] Testes de funcionalidades principais
- [ ] Documentação de uso
- [ ] Ajustes finais de UX
- [ ] Deploy final

## Fase 2: Upload de Imagens e Gestão de Expositores
- [x] Implementar upload de planta do evento (S3)
- [x] Adicionar preview da planta no formulário de evento
- [x] Criar página de gestão de expositores
- [x] Implementar upload de logo do expositor
- [x] Criar formulário de criação/edição de expositor
- [x] Sistema de marcação de posição na planta (clique para posicionar)
- [x] Visualizar expositores marcados na planta (admin)

## Bugs Reportados
- [x] Corrigir problema ao criar evento - não é possível criar planta de evento (Resolvido: corrigida ordem das rotas no App.tsx)
- [ ] Corrigir navegação do botão "Adicionar Expositor" na página de detalhes do evento

## Melhorias Solicitadas
- [x] Adicionar funcionalidade de zoom na planta (visualização pública e admin)
- [ ] Alterar título da aplicação de "Portal ERP - Gestão de Plantas de Eventos" para "Gestão de Plantas" (Nota: Alterar em Settings → General no Management UI)
- [x] Aumentar tamanho do logo do expositor nos marcadores da planta (aumentado de 12 para 20)

## Fase 3: Internacionalização (i18n)
- [x] Instalar e configurar biblioteca i18next
- [x] Criar arquivos de tradução (pt-BR, en, es)
- [x] Implementar seletor de idioma no header
- [x] Traduzir todas as páginas públicas
- [ ] Traduzir área administrativa (pendente)
- [x] Persistir preferência de idioma do usuário (localStorage)
- [x] Traduzir página Home (lista de eventos)

## Melhorias de UX
- [x] Implementar modal/drawer lateral com detalhes completos do expositor ao clicar
- [x] Adicionar botão "Visitado" para marcar expositores visitados
- [x] Adicionar botões de ação (salvar/compartilhar)
- [x] Exibir tags de categorias do expositor
- [x] Mostrar endereço completo do expositor (se disponível)
- [ ] Traduzir página Home (lista de eventos)

## Melhorias da Home
- [x] Criar seção "Eventos em Breve" na página inicial
- [x] Ordenar eventos por data (próximos primeiro)
- [x] Destacar visualmente eventos que acontecerão nos próximos 30 dias

## Identidade Visual
- [x] Analisar identidade visual do site erpsummit.com
- [x] Aplicar paleta de cores do ERP Summit (azul escuro #0a1628, laranja #f59e0b)
- [x] Ajustar tipografia conforme o site de referência
- [x] Atualizar componentes com o novo design system (tema dark)
- [ ] Alterar nome da plataforma para "ERP Summit | Gestão de Plantas" (requer alteração em VITE_APP_TITLE via Management UI)

## Melhorias de UX - Animações
- [x] Adicionar efeitos de transição suave (hover) em todos os botões
- [x] Adicionar efeitos de transição suave (hover) em todos os links
- [x] Adicionar efeitos de escala e brilho nos cards de eventos
- [x] Adicionar animações suaves em elementos interativos

## Melhorias de Layout
- [x] Aumentar área da planta na página pública (dar mais destaque)
- [x] Reduzir largura da coluna de expositores
- [x] Melhorar proporção entre planta e sidebar (alterado de 2:1 para 3:1)

## Melhorias de Interatividade
- [x] Implementar destaque visual na planta ao passar mouse sobre expositor na lista
- [x] Adicionar animação de pulso/brilho no marcador destacado (escala 125%, borda amarela, ring, animate-pulse)
- [x] Sincronizar hover entre lista de expositores e marcadores na planta

## Melhorias de Navegação
- [x] Centralizar planta na localização do expositor ao clicar
- [x] Aplicar zoom automático ao clicar em expositor (zoom 2x)
- [x] Adicionar animação suave de transição ao centralizar (0.5s ease-in-out)

## Identidade Visual - Página Pública do Evento
- [x] Aplicar tema dark do ERP Summit na página pública do evento
- [x] Atualizar header com cores do ERP Summit
- [x] Estilizar cards e seções com paleta de cores oficial
- [x] Ajustar botões e elementos interativos

## Segurança e UX - Área Administrativa
- [x] Remover botão "Admin Área" da página Home (visitantes não devem ver)
- [x] Remover botão "Admin Área" da página pública do evento
- [x] Manter acesso administrativo apenas via URL direta /admin

## Acessibilidade - Contraste de Cores
- [x] Revisar todos os textos da página Home para garantir cor branca/clara
- [x] Revisar todos os textos da página pública do evento para garantir cor branca/clara
- [x] Verificar contraste em cards de eventos
- [x] Verificar contraste em descrições e metadados
- [x] Garantir legibilidade em todos os elementos de texto

## Sistema de Patrocinadores
- [x] Criar tabela sponsors no banco de dados
- [x] Adicionar campos: name, logoUrl, website, tier, description, displayOrder, isActive
- [x] Criar router tRPC para patrocinadores (CRUD completo)
- [x] Criar funções de banco de dados (list, create, update, delete)
- [x] Implementar página de lista de patrocinadores no admin
- [x] Implementar formulário de criação/edição de patrocinador
- [x] Adicionar upload de logo para S3
- [x] Implementar sistema de níveis (Diamante/Ouro/Prata/Bronze)
- [x] Criar seção "Nossos Patrocinadores" na Home
- [x] Organizar patrocinadores por nível na visualização pública
- [x] Adicionar badges visuais para cada nível
- [x] Implementar hover effects nos cards de patrocinadores
- [x] Garantir responsividade (mobile/tablet/desktop)
- [x] Aplicar tema dark ERP Summit na seção

## Refatoração: Sistema de Patrocinadores Global
- [x] Criar tabela event_sponsors (eventId, sponsorId, tier, displayOrder)
- [x] Atualizar funções de banco para suportar vínculo evento-patrocinador
- [x] Criar router tRPC para event_sponsors (addToEvent, removeFromEvent, listByEvent, updateTier)
- [x] Criar aba "Patrocinadores" na página de detalhes do evento (admin)
- [x] Implementar modal de seleção de patrocinadores globais
- [x] Permitir definir nível e ordem ao vincular patrocinador ao evento
- [x] Atualizar SponsorsSection na Home para mostrar patrocinadores globais
- [x] Criar seção de patrocinadores na página pública do evento (mostrar apenas vinculados)
- [x] Remover campo eventId da tabela sponsors (se existir)
- [x] Migrar dados existentes para novo modelo (se necessário)

## Remoção: Zoom Automático ao Clicar em Expositor
- [x] Remover useEffect de zoom automático do ZoomableFloorPlan
- [x] Manter apenas drawer lateral e destaque visual
- [x] Testar que controles manuais de zoom continuam funcionando

## Campo showOnHome para Patrocinadores
- [x] Adicionar campo showOnHome (boolean, default true) na tabela sponsors
- [x] Executar db:push para atualizar banco de dados
- [x] Adicionar checkbox "Mostrar na página inicial (Home)" no formulário de patrocinador
- [x] Atualizar router sponsors.listActive para filtrar por showOnHome = true
- [x] Atualizar componente SponsorsSection para usar nova query
- [x] Testar criação de patrocinador com showOnHome = false
- [x] Verificar que patrocinador não aparece na Home mas aparece em eventos vinculados

## Personalização da Plataforma
- [x] Fazer upload do novo logo (logo-erp-summit.png) para S3
- [x] Atualizar APP_TITLE para "ERP Summit | event floor plan"
- [x] Atualizar APP_LOGO com URL do novo logo
- [x] Testar visualização em todas as páginas (Home, Admin, Página do Evento)

## Bug: Nome e Logo Não Atualizados
- [x] Investigar onde APP_LOGO está sendo usado no código
- [x] Verificar se const.ts está sendo importado corretamente
- [x] Corrigir referências ao logo no header
- [x] Testar que título e logo aparecem corretamente em todas as páginas

## Identidade Visual - ERP Summit
- [x] Acessar erpsummit.com.br e analisar identidade visual
- [x] Extrair paleta de cores (primária, secundária, acentos)
- [x] Identificar tipografia (fontes, tamanhos, pesos)
- [x] Analisar estilo de botões, cards e componentes
- [x] Aplicar cores no index.css (CSS variables)
- [x] Atualizar componentes com novos estilos
- [x] Substituir laranja (#f59e0b) por amarelo-verde (#c8ff00)
- [x] Adicionar bordas coloridas nos cards (card-border-gradient)
- [x] Implementar glow effect nos hovers
- [x] Atualizar marcadores da planta com nova cor
- [x] Atualizar links e elementos de destaque
- [x] Testar consistência visual em todas as páginas

## Bug: Data Incorreta
- [x] Investigar problema de timezone na exibição de datas
- [x] Criar funções utilitárias formatEventDate e formatShortDate com timeZone: 'UTC'
- [x] Corrigir formatação de data na página pública do evento
- [x] Corrigir formatação de data na página Home
- [x] Corrigir formatação de data no Dashboard admin
- [x] Corrigir formatação de data no EventsList admin
- [x] Corrigir formatação de data no EventDetail admin
- [x] Testar que data 17 de março de 2026 aparece corretamente

## Exibição Híbrida de Datas (Múltiplos Dias)
- [x] Criar função formatDateRange() em dateUtils.ts
- [x] Implementar lógica para detectar 1 dia vs múltiplos dias
- [x] Implementar formatação inteligente (mesmo mês, meses diferentes, anos diferentes)
- [x] Atualizar cards da Home para usar formatDateRange
- [x] Atualizar cabeçalho da página pública do evento
- [x] Manter seção de detalhes com datas separadas (início/término) - Não necessário, formato compacto é suficiente
- [x] Testar com evento de 1 dia - Funciona corretamente (mostra apenas data de início)
- [x] Testar com evento de múltiplos dias no mesmo mês - Funciona perfeitamente ("17 a 18 de março de 2026")
- [x] Testar com evento que cruza meses - Lógica implementada e pronta para uso

## Revisão de Cores de Texto (Branco vs Preto)
- [x] Varrer todos os arquivos .tsx para identificar textos em preto - 13 ocorrências encontradas
- [x] Revisar página Home - OK (apenas 1 texto condicional)
- [x] Revisar página pública do evento - OK
- [x] Revisar área administrativa (Dashboard, EventsList, EventDetail) - 11 problemas encontrados
- [x] Revisar componentes (ZoomableFloorPlan, ExhibitorDrawer, etc) - 1 problema encontrado
- [x] Aplicar correções necessárias - Todos os text-gray-900 substituídos por text-white
- [x] Corrigir cor do seletor de idioma (LanguageSwitcher)
- [x] Testar visualmente todas as páginas - Confirmado que textos estão corretos
- [x] Páginas públicas (Home, Evento) - Textos em BRANCO sobre fundo azul escuro
- [x] Área administrativa - Textos em PRETO sobre fundo branco
- [x] Seletor de idioma - BRANCO em todas as páginas públicas

## Bug: Dropdown do Seletor de Idioma com Texto Preto
- [x] Investigar componente DropdownMenuContent (shadcn/ui)
- [x] Corrigir cor do texto das opções do dropdown para branco - Substituído text-popover-foreground por text-white
- [x] Testar dropdown aberto com fundo escuro - Confirmado que texto está em PRETO (precisa correção)

## Bug: Ícones de Controle da Planta em Preto
- [x] Localizar componente ZoomableFloorPlan
- [x] Corrigir cor dos ícones (zoom in, zoom out, reset) para branco - text-white aplicado
- [x] Adicionar maior destaque aos botões - bg-white/10, hover:bg-white/20, border-white/30
- [x] Aumentar tamanho dos ícones de h-4 w-4 para h-5 w-5
- [x] Testar visualmente na página do evento - Pendente de republicação para teste no link público

## Ajuste: Logo do Expositor na Planta
- [x] Localizar onde o logo é renderizado no ZoomableFloorPlan
- [x] Ajustar para formato quadrado - rounded-lg ao invés de rounded-full
- [x] Reduzir tamanho - de w-20 h-20 para w-12 h-12
- [x] Ajustar object-fit - de object-cover para object-contain com padding
- [x] Testar visualmente na página do evento - Aguardando republicação

## Feature: Animação de Zoom no Hover do Logo
- [x] Adicionar transição suave no hover - hover:scale-125 aplicado
- [x] Ajustar duração e easing - duration-500 ease-out
- [x] Adicionar efeitos visuais extras - hover:shadow-xl e hover:border-[#c8ff00]/70
- [x] Aumentar scale quando selecionado - scale-150 (antes era scale-125)
- [x] Testar visualmente na página do evento - Aguardando republicação

## Responsividade Mobile
- [x] Analisar página Home em mobile
- [x] Ajustar cards de eventos para mobile (grid responsivo) - Já estava com grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- [x] Ajustar espaçamentos e padding para telas pequenas - py-8 md:py-12, text-2xl md:text-3xl
- [x] Ajustar header para mobile - h-8 md:h-10, text-lg md:text-2xl
- [x] Ajustar hero section para mobile - py-12 md:py-20, text-3xl md:text-4xl lg:text-5xl
- [x] Analisar página pública do evento em mobile
- [x] Ajustar layout da planta + sidebar de expositores - grid responsivo, sticky apenas em lg+
- [x] Ajustar controles de zoom para mobile - h-9 w-9 md:h-10 md:w-10, top-2 right-2 md:top-4 md:right-4
- [x] Ajustar header da página do evento - h-8 md:h-10, text-base md:text-xl, botão com texto hidden md:inline
- [x] Ajustar event header - text-2xl md:text-4xl, py-6 md:py-12
- [x] Ajustar padding dos cards - p-4 md:p-6
- [x] Testar em diferentes breakpoints (sm, md, lg) - Aguardando republicação para teste final

## Reposicionamento dos Botões de Controle da Planta
- [x] Mudar posição de top-right para bottom-right
- [x] Ajustar para mobile: bottom-4 right-4
- [x] Ajustar para desktop: bottom-6 right-6
- [x] Aumentar tamanho dos botões - h-10 w-10 md:h-12 md:w-12 (antes era h-9 w-9 md:h-10 md:w-10)
- [x] Aumentar tamanho dos ícones - h-5 w-5 md:h-6 md:w-6 (antes era h-4 w-4 md:h-5 md:w-5)
- [x] Aumentar gap entre botões - gap-2 md:gap-3 (antes era gap-1.5 md:gap-2)
- [x] Testar ergonomia em mobile - Aguardando republicação para teste final

## Feature: Popover de Informações do Expositor
- [x] Criar componente ExhibitorPopover - Integrado diretamente no ZoomableFloorPlan
- [x] Adicionar estado para controlar popover aberto/fechado - popoverExhibitorId
- [x] Implementar posicionamento automático próximo ao logo - absolute bottom-full
- [x] Exibir nome do expositor
- [x] Exibir número do estande (booth) - com ícone MapPin
- [x] Exibir categoria - com ícone Tag
- [x] Exibir descrição - line-clamp-3
- [x] Exibir link do site (se disponível) - com ícone ExternalLink
- [x] Adicionar botão de fechar - ícone X
- [x] Estilizar com identidade visual ERP Summit - bg-[#0f1f3a], border-[#c8ff00], shadow-[#c8ff00]/20
- [x] Adicionar campos ao ZoomableFloorPlanProps - category, description, website, boothNumber
- [x] Atualizar PublicEvent para passar dados adicionais
- [x] Testar interação (abrir/fechar ao clicar) - Aguardando republicação para teste final

## Reposicionamento dos Botões para Fora da Planta
- [x] Modificar estrutura do ZoomableFloorPlan - Adicionado prop onControlsReady
- [x] Atualizar PublicEvent para renderizar botões ao lado do título - useState + onControlsReady
- [x] Mudar layout dos botões de vertical para horizontal - flex gap-2
- [x] Alinhar botões à direita do título "Plano del Evento" - justify-between
- [x] Ajustar espaçamento e responsividade - h-9 w-9 md:h-10 md:w-10
- [x] Testar em desktop e mobile - Aguardando republicação para teste final

## Remover Badge "Made with Manus"
- [x] Localizar onde o badge está sendo renderizado - Canto inferior direito, injetado pela plataforma
- [x] Adicionar CSS para ocultar o badge - Regras CSS adicionadas ao index.css
- [ ] Testar se o badge foi removido

## Bug: Acesso ao Painel Admin Após Login
- [x] Investigar problema de redirecionamento após login (usuário faz login mas não acessa /admin)
- [x] Implementar parâmetro returnTo na função getLoginUrl
- [x] Atualizar DashboardLayout para passar caminho atual ao fazer login
- [x] Modificar oauth.ts para ler returnTo e redirecionar corretamente
- [x] Testar fluxo completo de autenticação no ambiente de desenvolvimento
