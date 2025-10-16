# Sistema de Controle de Férias

Sistema completo de gestão de férias profissionais com dashboard de impacto financeiro, desenvolvido com Next.js, TypeScript e Tailwind CSS.

## 📋 Funcionalidades

- **Autenticação de Usuários** - Sistema seguro de login e registro
- **Gestão de Profissionais** - Cadastro e gerenciamento de profissionais com informações de faturamento
- **Períodos de Férias** - Controle de períodos aquisitivos e de gozo
- **Cálculos Automáticos** - Total de dias e abatimento de faturamento calculados automaticamente
- **Dashboard Financeiro** - Visualização do impacto financeiro das férias com gráficos interativos
- **Interface Moderna** - UI limpa e responsiva com dark mode

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utility-first
- **NextAuth.js** - Autenticação
- **Recharts** - Visualização de dados
- **Lucide React** - Ícones modernos
- **date-fns** - Manipulação de datas

## 📦 Instalação

1. **Clone o repositório**

```bash
git clone <repository-url>
cd sistema-ferias
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

Para gerar uma chave secreta segura, execute:

```bash
openssl rand -base64 32
```

4. **Execute o servidor de desenvolvimento**

```bash
npm run dev
```

5. **Acesse a aplicação**

Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 📖 Como Usar

### 🎯 Modo Demonstração (Recomendado para Primeiro Acesso)

Na tela de login, clique no botão **"Acessar Demonstração"** para explorar o sistema com dados de exemplo pré-carregados:
- **12 profissionais** cadastrados
- **42 períodos de férias** com distribuição variada ao longo de 2024
- **Dashboard completo** com gráficos interativos e métricas
- **Padrões realistas** - picos em julho (8 férias) e dezembro (7 férias)
- **Visualização detalhada** de impacto financeiro mensal
- **Somente visualização** - modificações não são permitidas

Credenciais de demonstração (caso queira fazer login manual):
- Email: `demo@sistema-ferias.com`
- Senha: `demo123`

### 1. Primeiro Acesso (Criando Conta Própria)

- Acesse `/register` para criar uma conta
- Faça login com suas credenciais

### 2. Cadastrar Profissionais

- Navegue até "Profissionais"
- Clique em "Novo Profissional"
- Preencha os dados:
  - Nome do profissional
  - Gestor no cliente
  - Faturamento mensal

### 3. Registrar Férias

- Navegue até "Férias"
- Clique em "Novo Período"
- Selecione o profissional
- Informe as datas:
  - Período aquisitivo (início e fim)
  - Período de gozo (início e fim)
- O sistema calculará automaticamente:
  - Total de dias de férias
  - Abatimento no faturamento

### 4. Visualizar Dashboard

- Navegue até "Dashboard"
- Visualize:
  - Total de profissionais
  - Total de dias de férias
  - Impacto financeiro total
  - Gráficos por mês
  - Tabela de impacto por profissional

## 🗂️ Estrutura do Projeto

```txt
sistema-ferias/
├── app/                          # App Router do Next.js
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Autenticação
│   │   ├── dashboard/            # Dados do dashboard
│   │   ├── professionals/        # CRUD de profissionais
│   │   └── vacations/            # CRUD de férias
│   ├── dashboard/                # Página do dashboard
│   ├── login/                    # Página de login
│   ├── professionals/            # Página de profissionais
│   ├── register/                 # Página de registro
│   ├── vacations/                # Página de férias
│   ├── globals.css               # Estilos globais
│   └── layout.tsx                # Layout raiz
├── components/                   # Componentes React reutilizáveis
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   ├── Navbar.tsx
│   └── Providers.tsx
├── lib/                          # Funções utilitárias
│   ├── auth.ts                   # Lógica de autenticação
│   ├── auth-config.ts            # Configuração NextAuth
│   ├── db.ts                     # Funções de banco de dados
│   └── utils.ts                  # Utilitários gerais
├── types/                        # Definições TypeScript
│   ├── index.ts                  # Tipos principais
│   └── next-auth.d.ts            # Tipos NextAuth
├── data/                         # Arquivos de dados JSON (criado automaticamente)
├── middleware.ts                 # Middleware de autenticação
├── next.config.js                # Configuração Next.js
├── tailwind.config.ts            # Configuração Tailwind
└── package.json                  # Dependências
```

## 💾 Armazenamento de Dados

O sistema utiliza arquivos JSON locais para armazenamento de dados. Os arquivos são criados automaticamente na pasta `data/`:

- `users.json` - Dados dos usuários
- `professionals.json` - Dados dos profissionais
- `vacations.json` - Dados dos períodos de férias

**Nota**: Para produção, considere migrar para um banco de dados real (PostgreSQL, MongoDB, etc.)

## 🎨 Design

- **Tipografia**: PT Sans (Google Fonts)
- **Cores**: Paleta moderna com suporte a dark mode
- **Layout**: Limpo e direto com apresentação clara de dados
- **Ícones**: Lucide React - simples e reconhecíveis
- **Animações**: Transições suaves nas atualizações

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação JWT via NextAuth.js
- Rotas protegidas via middleware
- Validação de dados no servidor
- Isolamento de dados por usuário

## 🛠️ Scripts Disponíveis

```bash
npm run dev      # Inicia o servidor de desenvolvimento
npm run build    # Cria build de produção
npm run start    # Inicia o servidor de produção
npm run lint     # Executa o linter
```

## 🔧 Solução de Problemas

### Erro de Cache do Webpack

Se você encontrar o erro `[webpack.cache.PackFileCacheStrategy] Caching failed for pack`:

**Solução rápida (PowerShell):**
```powershell
.\clear-cache.ps1
npm run dev
```

**Solução manual:**
```powershell
# Parar o servidor (Ctrl+C)
Remove-Item -Recurse -Force .next
npm run dev
```

Este erro foi corrigido na configuração do webpack, mas pode aparecer ocasionalmente. A configuração atual usa cache em memória no desenvolvimento para evitar esse problema.

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🌙 Dark Mode

O sistema suporta dark mode automático baseado nas preferências do sistema operacional do usuário.

## 🚀 Deploy

### Deploy na Vercel (Recomendado)

A Vercel é a plataforma oficial para Next.js e oferece deploy gratuito com:

- ✅ HTTPS automático
- ✅ Proteção DDoS incluída
- ✅ CDN global
- ✅ Preview URLs para cada PR
- ✅ Zero configuração necessária

#### Opção 1: Via Dashboard Web

1. Acesse https://vercel.com/new
2. Conecte sua conta GitHub
3. Importe este repositório
4. Configure as variáveis de ambiente:
   ```
   NEXTAUTH_URL=https://seu-projeto.vercel.app
   NEXTAUTH_SECRET=sua-chave-secreta-aqui
   ```
5. Clique em "Deploy"

#### Opção 2: Via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy em produção
vercel --prod
```

#### Configurar Variáveis de Ambiente

```bash
# Adicionar NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET production

# Adicionar NEXTAUTH_URL
vercel env add NEXTAUTH_URL production
```

**Nota:** Gere uma chave segura com:
```bash
openssl rand -base64 32
```

### ⚠️ Importante: Persistência de Dados

Esta aplicação usa arquivos JSON locais para armazenamento. Em produção na Vercel:

- ✅ O **modo demonstração** funciona perfeitamente
- ⚠️ Dados de usuários **não persistem** entre deploys
- 📝 Para uso real, migre para um banco de dados:
  - Supabase (PostgreSQL)
  - Vercel Postgres
  - MongoDB Atlas

## 📄 Licença

Este projeto é privado e de uso interno.

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Crie uma branch para sua feature
2. Faça commit das alterações
3. Abra um Pull Request

## 📞 Suporte

Para questões ou suporte, entre em contato com a equipe de desenvolvimento.
