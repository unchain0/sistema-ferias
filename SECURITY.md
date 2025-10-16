# 🔒 Guia de Segurança - Sistema de Férias

Este documento descreve as medidas de segurança implementadas e como configurar proteção adicional contra ataques DDoS usando Cloudflare.

## 🛡️ Segurança Implementada

### 1. **Rate Limiting (Limitação de Taxa)**

Proteção contra ataques de força bruta e abuso de API:

- **Registro**: 5 tentativas por 15 minutos por IP
- **Login**: Protegido pelo NextAuth com tentativas limitadas
- **API Endpoints**: Proteção por IP

### 2. **Headers de Segurança HTTP**

Headers implementados automaticamente em todas as páginas:

```
✓ Strict-Transport-Security (HSTS)
✓ X-Frame-Options (SAMEORIGIN) - Previne clickjacking
✓ X-Content-Type-Options (nosniff)
✓ X-XSS-Protection
✓ Referrer-Policy
✓ Permissions-Policy
✓ Content-Security-Policy (CSP)
```

### 3. **Validação de Input**

- Validação com Zod para todos os inputs
- Sanitização de strings para prevenir XSS
- Validação de formato de email
- Validação de força de senha (mínimo 6 caracteres)
- Limite de tamanho em todos os campos

### 4. **Autenticação Segura**

- Senhas criptografadas com bcrypt (12 rounds)
- JWT tokens via NextAuth.js
- Session management seguro
- CSRF protection automático

### 5. **Proteção de Dados**

- Isolamento de dados por usuário
- Validação de propriedade em todas as operações
- Modo demonstração com proteção contra modificações

### 6. **Segurança na Aplicação**

- React Strict Mode habilitado
- Header `X-Powered-By` removido
- Validação de UUIDs
- Sanitização de HTML

## ☁️ Configuração do Cloudflare (Recomendado)

O Cloudflare oferece proteção gratuita contra DDoS e outras ameaças. Siga este guia:

### Passo 1: Criar Conta no Cloudflare

1. Acesse: https://www.cloudflare.com/
2. Clique em "Sign Up" (é gratuito!)
3. Confirme seu email

### Passo 2: Adicionar seu Site

1. No dashboard do Cloudflare, clique em "Add a Site"
2. Digite seu domínio (ex: `meusite.com.br`)
3. Escolha o plano **FREE** (gratuito)
4. Clique em "Add Site"

### Passo 3: Configurar DNS

1. O Cloudflare escaneará seus registros DNS atuais
2. Verifique se todos os registros importantes estão listados
3. **Ative o proxy** (nuvem laranja) para os registros que deseja proteger
4. Clique em "Continue"

### Passo 4: Atualizar Nameservers

1. O Cloudflare fornecerá 2 nameservers
2. Acesse o painel do seu registrador de domínio (Registro.br, GoDaddy, etc.)
3. Substitua os nameservers atuais pelos do Cloudflare
4. Aguarde propagação (pode levar até 24h)

### Passo 5: Configurar Proteções (Dashboard Cloudflare)

#### A. Proteção contra DDoS (Já ativa por padrão!)
- ✅ Proteção automática contra DDoS Layer 3/4
- ✅ Mitigação automática de ataques volumétricos

#### B. Firewall Rules (Grátis)

Em **Security > WAF**, configure regras:

```
1. Bloquear países suspeitos (opcional):
   - Campo: Country
   - Operador: equals
   - Valor: [países a bloquear]
   - Ação: Block

2. Rate Limiting adicional:
   - Security > Rate Limiting > Create rule
   - Requests: 100 por minuto
   - Path: /api/*
   - Ação: Block
```

#### C. Bot Protection

Em **Security > Bots**:
- ✅ Ative "Bot Fight Mode" (grátis)
- Protege contra bots maliciosos automaticamente

#### D. SSL/TLS

Em **SSL/TLS**:
- Selecione: **"Full (strict)"**
- Ative: "Always Use HTTPS"
- Ative: "Automatic HTTPS Rewrites"

#### E. Cache e Performance

Em **Caching**:
- Development Mode: OFF
- Caching Level: Standard

Em **Speed > Optimization**:
- ✅ Auto Minify (JS, CSS, HTML)
- ✅ Brotli compression
- ✅ Rocket Loader (melhora performance)

### Passo 6: Configurações Recomendadas Extras

#### Page Rules (3 grátis)

Criar regras para otimizar:

```
1. Regra para APIs:
   URL: *meusite.com/api/*
   Settings:
   - Cache Level: Bypass
   - Security Level: High

2. Regra para arquivos estáticos:
   URL: *meusite.com/_next/static/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
```

#### Under Attack Mode

Se estiver sob ataque DDoS:
1. Vá em **Security > Settings**
2. Mude Security Level para **"I'm Under Attack!"**
3. Visitantes verão uma verificação antes de acessar o site
4. Volte ao normal quando o ataque cessar

## 🌐 Alternativas Gratuitas ao Cloudflare

### 1. **Vercel** (Recomendado para Next.js)
- Deploy nativo de aplicações Next.js
- Proteção DDoS incluída
- CDN global
- HTTPS automático
- Gratuito para projetos pessoais

**Como usar:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 2. **Netlify**
- Proteção DDoS básica
- CDN global
- HTTPS automático
- 100GB bandwidth/mês grátis

### 3. **AWS CloudFront** (Free Tier)
- 1TB de transferência grátis (12 meses)
- Proteção DDoS com AWS Shield Standard

## 🔐 Checklist de Segurança para Produção

Antes de colocar em produção, verifique:

- [ ] HTTPS habilitado (SSL/TLS)
- [ ] Cloudflare ou similar configurado
- [ ] Variáveis de ambiente seguras (`.env.local` não commitado)
- [ ] `NEXTAUTH_SECRET` gerado com `openssl rand -base64 32`
- [ ] Backup automático dos dados configurado
- [ ] Monitoramento de logs ativo
- [ ] Rate limiting testado
- [ ] Headers de segurança verificados
- [ ] Testes de penetração básicos realizados
- [ ] Política de senha forte (considere aumentar para 8+ caracteres)
- [ ] 2FA implementado (futuro)

## 🚨 Resposta a Incidentes

### Se detectar ataque DDoS:

1. **Cloudflare**: Ative "Under Attack Mode"
2. **Logs**: Verifique logs para identificar padrões
3. **Firewall**: Bloqueie IPs/países suspeitos
4. **Contato**: Entre em contato com seu provedor de hospedagem

### Se detectar vazamento de dados:

1. **Isole**: Desative o sistema imediatamente
2. **Investigue**: Identifique a origem do vazamento
3. **Notifique**: Informe usuários afetados (LGPD)
4. **Corrija**: Implemente correções de segurança
5. **Monitore**: Aumente monitoramento pós-incidente

## 📊 Monitoramento de Segurança

### Ferramentas Recomendadas (Gratuitas):

1. **Cloudflare Analytics**
   - Visualize ataques bloqueados
   - Monitore tráfego suspeito

2. **Better Uptime** (betteruptime.com)
   - Monitoramento de uptime gratuito
   - Alertas por email

3. **Security Headers** (securityheaders.com)
   - Teste seus headers de segurança
   - Nota de A+ recomendada

4. **SSL Labs** (ssllabs.com/ssltest)
   - Teste configuração SSL
   - Nota A recomendada

## 📖 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Cloudflare Learning Center](https://www.cloudflare.com/learning/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [LGPD - Lei Geral de Proteção de Dados](https://www.gov.br/lgpd)

## 🆘 Suporte

Para questões de segurança críticas, contate imediatamente a equipe de desenvolvimento.

**Nunca compartilhe:**
- Senhas
- Tokens de API
- Chaves secretas
- Informações de usuários
