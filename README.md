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
   ````powershell
   $env:DOCKER_HOST="npipe:////./pipe/podman-machine-default"
    ```
   ````

#### Solução de Problemas: "File name too long" (Linux/Podman)

Se você usa Linux com pasta Home criptografada (ecryptfs) e receber o erro `file name too long`, o Podman não conseguirá extrair as imagens do Supabase.

**Solução:**

1. Crie uma pasta fora da sua Home criptografada: `mkdir -p /var/tmp/podman-$USER`
2. Crie/Edite o arquivo `~/.config/containers/storage.conf`:
   ```toml
   [storage]
   driver = "overlay"
   graphroot = "/var/tmp/podman-seu-usuario"
   ```
3. Execute `podman system migrate`.

---

2. **Iniciar Supabase**:
   ```bash
   npm run supabase:start
   ```
3. **Configurar Ambiente**:
   ```bash
   cp .env.example .env.local
   ```
4. **Verificar Status**:
   ```bash
   npm run supabase:status
   ```
   (Atualize o seu `.env.local` com as chaves exibidas).

### Comandos Supabase úteis

- `npm run supabase:start`: Inicia o ambiente (Docker/Podman).
- `npm run supabase:stop`: Para o ambiente.
- `npm run supabase:status`: Mostra URLs e chaves locais.
- `npm run supabase:reset`: Reseta o banco e aplica as migrations da pasta `supabase/migrations`.
- `npx supabase migration new nome_da_migracao`: Cria uma nova migração.

## CI/CD (GitHub Actions)

O projeto possui um pipeline de CI/CD automatizado para o Supabase:

1. **Testes de Migração**: Toda PR ou push para `main`/`dev` valida se as migrações SQL aplicam corretamente em um container limpo.
2. **Deploy Automático**: Ao fazer push para a branch `main`, as migrações são enviadas automaticamente para o projeto de produção no Supabase.

### Configuração Necessária (GitHub Secrets)

Para que o deploy funcione, você deve configurar os seguintes **Secrets** no seu repositório GitHub (Settings > Secrets and variables > Actions):

- `SUPABASE_ACCESS_TOKEN`: Token de acesso pessoal ([Dashboard Supabase > Account](https://supabase.com/dashboard/account/tokens)).
- `SUPABASE_PROJECT_ID`: ID de referência do projeto de produção (encontrado na URL do dashboard ou Settings > API).
- `SUPABASE_DB_PASSWORD`: Senha do banco de dados de produção.

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
