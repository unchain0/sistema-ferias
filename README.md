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

Clone o repositório

```bash
git clone <repository-url>
cd sistema-ferias
```

Instale as dependências

```bash
npm install
```

Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

Para gerar uma chave secreta segura, execute:

```bash
openssl rand -base64 32
```

Execute o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:5000](http://localhost:5000) no seu navegador
