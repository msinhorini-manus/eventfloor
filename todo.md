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
