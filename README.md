# Event Floor Plan - Sistema de Gestão de Plantas de Eventos

Sistema completo de gestão e visualização interativa de plantas de eventos, desenvolvido para o ERP Summit Brasil.

## 🎯 Funcionalidades Principais

### Área Administrativa
- **Gestão de Eventos**: Criação, edição e publicação de eventos
- **Upload de Plantas**: Sistema de upload de imagens de plantas de eventos para S3
- **Gestão de Expositores**: CRUD completo com informações detalhadas
  - Dados básicos (nome, categoria, descrição, website)
  - Informações de contato completas (endereço, telefone, WhatsApp, e-mail)
  - Redes sociais (Facebook, Instagram, LinkedIn, Twitter, YouTube)
  - Upload de logos
  - Posicionamento interativo na planta (modo fullscreen com zoom e pan)
- **Sistema de Patrocinadores**: Gestão global de patrocinadores com níveis (Diamante, Ouro, Prata, Bronze)
- **Autenticação**: Sistema de autenticação OAuth integrado

### Visualização Pública
- **Planta Interativa**: 
  - Zoom e pan com controles intuitivos
  - Marcadores visuais dos expositores na planta
  - Destaque visual ao passar o mouse
  - Centralização automática ao clicar
- **Lista de Expositores**: 
  - Busca em tempo real
  - Filtros por categoria
  - Sincronização com marcadores na planta
- **Drawer de Detalhes**: 
  - Informações completas do expositor
  - Links clicáveis (telefone, WhatsApp, e-mail, website)
  - Badges de redes sociais com cores características
  - Botão "Marcar como Visitado"
- **Internacionalização**: Suporte para Português, Inglês e Espanhol
- **Responsividade**: Design otimizado para desktop, tablet e mobile

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** com TypeScript
- **Tailwind CSS 4** para estilização
- **tRPC 11** para comunicação type-safe com o backend
- **Wouter** para roteamento
- **i18next** para internacionalização
- **shadcn/ui** para componentes de UI
- **Lucide React** para ícones

### Backend
- **Node.js** com Express 4
- **tRPC 11** para APIs type-safe
- **Drizzle ORM** para banco de dados
- **MySQL/TiDB** como banco de dados
- **S3** para armazenamento de arquivos (plantas e logos)
- **OAuth** para autenticação

### DevOps
- **Vite** para build e desenvolvimento
- **pnpm** para gerenciamento de pacotes
- **GitHub** para versionamento

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 22.x
- pnpm
- Banco de dados MySQL/TiDB
- Bucket S3 configurado

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/msinhorini-manus/eventfloor.git
cd eventfloor

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
# Copie o arquivo .env.example para .env.local e preencha as variáveis

# Executar migrações do banco de dados
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

### Variáveis de Ambiente Necessárias

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@host:port/database

# Autenticação
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# S3 Storage
# Configurado automaticamente pela plataforma Manus

# Aplicação
VITE_APP_TITLE=ERP Summit | event floor plan
VITE_APP_LOGO=https://your-logo-url.com/logo.png
```

## 📁 Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── public/            # Arquivos estáticos
│   └── src/
│       ├── components/    # Componentes reutilizáveis
│       ├── pages/         # Páginas da aplicação
│       ├── contexts/      # Contextos React
│       ├── hooks/         # Custom hooks
│       ├── lib/           # Bibliotecas e utilitários
│       └── locales/       # Arquivos de tradução (i18n)
├── server/                # Backend Node.js
│   ├── _core/            # Configurações core (OAuth, LLM, etc)
│   ├── db.ts             # Funções de banco de dados
│   └── routers.ts        # Routers tRPC
├── drizzle/              # Schema e migrações do banco
├── storage/              # Helpers para S3
└── shared/               # Código compartilhado (tipos, constantes)
```

## 🎨 Identidade Visual

O projeto segue a identidade visual do ERP Summit:
- **Cor Primária**: Azul escuro (#0a1628)
- **Cor de Destaque**: Amarelo-verde (#c8ff00)
- **Tema**: Dark mode
- **Tipografia**: System fonts com fallback para sans-serif

## 📝 Funcionalidades Detalhadas

### Sistema de Posicionamento de Expositores
- Interface fullscreen para posicionamento preciso
- Zoom com mouse wheel e botões
- Pan/arrastar para navegar
- Marcador visual grande durante posicionamento
- Coordenadas em tempo real (X%, Y%)
- Atalhos de teclado (ESC cancelar, Enter confirmar)

### Sistema de Patrocinadores
- Gestão global de patrocinadores
- Vínculo de patrocinadores a eventos específicos
- Níveis personalizáveis (Diamante, Ouro, Prata, Bronze)
- Controle de exibição na página inicial
- Ordenação customizável

### Internacionalização (i18n)
- Suporte completo para 3 idiomas (pt-BR, en, es)
- Seletor de idioma no header
- Persistência da preferência no localStorage
- Traduções para todas as páginas públicas

## 🔒 Segurança

- Autenticação OAuth integrada
- Rotas protegidas com middleware
- Validação de dados com Zod
- CORS configurado
- Cookies seguros com httpOnly

## 📊 Banco de Dados

### Principais Tabelas
- **events**: Eventos com plantas
- **exhibitors**: Expositores com informações completas
- **sponsors**: Patrocinadores globais
- **event_sponsors**: Vínculo evento-patrocinador
- **users**: Usuários autenticados

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estas diretrizes:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido para o ERP Summit Brasil.

## 👥 Autores

- **Marcelo Sinhorini** - Desenvolvimento completo

## 🙏 Agradecimentos

- Equipe ERP Summit pela oportunidade
- Manus Platform pela infraestrutura
- Comunidade open-source pelas ferramentas incríveis

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através do GitHub Issues.

---

**Desenvolvido com ❤️ para o ERP Summit Brasil 2026**
