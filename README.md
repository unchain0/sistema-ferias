# Sistema de Controle de Férias

Aplicação para gestão de férias com dashboard de impacto financeiro.

## Requisitos

- Node.js `24.x`
- Um projeto no Supabase (URL/keys)

## Comandos básicos

```bash
# instalar dependências
npm install

# configurar ambiente
cp .env.example .env.local

# rodar em desenvolvimento
npm run dev

# build/produção
npm run build
npm run start

# seed de dados demo (requer Supabase configurado no .env.local)
npm run seed:demo

# testes
npm test
npm run test:coverage
npm run test:e2e
```

Acesse `http://localhost:5000`.

## Variáveis de ambiente

Edite o `.env.local` (base: `.env.example`). Principais variáveis:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_JWT_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
