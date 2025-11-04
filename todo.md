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

## Melhorias de UX
- [x] Implementar modal/drawer lateral com detalhes completos do expositor ao clicar
- [x] Adicionar botão "Visitado" para marcar expositores visitados
- [x] Adicionar botões de ação (salvar/compartilhar)
- [x] Exibir tags de categorias do expositor
- [x] Mostrar endereço completo do expositor (se disponível)
