# Sistema de Controle de Férias

Aplicação para gestão de férias com dashboard de impacto financeiro.

## Requisitos

- Node.js `24.x`
- Um projeto no Supabase (URL/keys)

## Desenvolvimento Local (Supabase Local)

Para rodar o banco de dados localmente (PostgreSQL + ferramentas Supabase):

1. **Requisitos**: Docker (ou Podman) instalado e rodando.

### Configuração para usuários de Podman

Se você utiliza Podman em vez de Docker, siga as instruções de acordo com seu sistema operacional:

#### Linux

```bash
# Iniciar o socket do Podman para o usuário
systemctl --user enable podman.socket
systemctl --user start podman.socket

# Configurar a variável de ambiente (adicione ao seu .bashrc ou .zshrc)
export DOCKER_HOST=unix:///run/user/$(id -u)/podman/podman.sock
```

#### macOS

1. Certifique-se de que a máquina do Podman está rodando: `podman machine start`.
2. Obtenha o caminho do socket:
   ```bash
   podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}'
   ```
3. Configure a variável de ambiente:
   ```bash
   export DOCKER_HOST=unix://<caminho_obtido_acima>
   ```

#### Windows (PowerShell)

1. Certifique-se de que a máquina do Podman está rodando: `podman machine start`.
2. Obtenha o caminho do pipe:
   ```powershell
   podman machine inspect --format '{{.ConnectionInfo.PodmanPipe.Path}}'
   # Exemplo de saída: \\.\pipe\podman-machine-default
   ```
3. Configure a variável de ambiente (convertendo barras invertidas):
   ```powershell
   $env:DOCKER_HOST="npipe:////./pipe/podman-machine-default"
   ```

---

2. **Iniciar Supabase**:
   ```bash
   npm run supabase:start
   ```
3. **Configurar Ambiente**:
   ```bash
   cp .env.local.example .env.local
   ```
4. **Verificar Status**:
   ```bash
   npm run supabase:status
   ```
   (Se as chaves forem diferentes das do `.env.local.example`, atualize o seu `.env.local`).

### Comandos Supabase úteis

- `npm run supabase:start`: Inicia o ambiente (Docker/Podman).
- `npm run supabase:stop`: Para o ambiente.
- `npm run supabase:status`: Mostra URLs e chaves locais.
- `npm run supabase:reset`: Reseta o banco e aplica as migrations da pasta `supabase/migrations`.

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
