# 🔧 Configuração de Variáveis de Ambiente

## ⚠️ IMPORTANTE: NEXT_PUBLIC_APP_URL

A variável `NEXT_PUBLIC_APP_URL` é **obrigatória** para o funcionamento correto da aplicação. Ela resolve o problema de "fetch failed" nas páginas server-side.

## 📋 Passo a Passo

### 1. Criar o arquivo `.env.local`

Crie um arquivo chamado `.env.local` na **raiz do projeto** (mesmo diretório do `package.json`):

```bash
# No terminal:
touch .env.local
```

### 2. Configurar as variáveis obrigatórias

Adicione o seguinte conteúdo no arquivo `.env.local`:

```bash
# ====================================================
# CONFIGURAÇÃO OBRIGATÓRIA
# ====================================================

# URL da aplicação (OBRIGATÓRIA)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ====================================================
# APIS RECOMENDADAS (Configure pelo menos uma)
# ====================================================

# TheSportsDB (GRATUITA) - Funciona automaticamente
# Não precisa de configuração

# FootballData (RECOMENDADA - €29/mês)
# Cadastre-se em: https://www.football-data.org/
FOOTBALL_DATA_API_KEY=sua_chave_aqui

# ====================================================
# CONFIGURAÇÕES OPCIONAIS
# ====================================================

# APIFootball (Para odds e predições)
# API_FOOTBALL_KEY=sua_chave_rapidapi_aqui

# SportMonks (Premium)
# SPORTMONKS_API_KEY=sua_chave_sportmonks_aqui
# SPORTMONKS_BASE_URL=https://api.sportmonks.com/v3

# Cache settings
CACHE_TTL=300
API_TIMEOUT=10000
```

### 3. Para produção (Vercel)

No painel do Vercel, configure as variáveis de ambiente:

1. Acesse seu projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione:

```
NEXT_PUBLIC_APP_URL = https://seu-dominio.vercel.app
FOOTBALL_DATA_API_KEY = sua_chave_real_aqui
```

## 🚀 Como Obter as Chaves das APIs

### FootballData (RECOMENDADA)
1. Acesse: https://www.football-data.org/
2. Crie uma conta gratuita
3. Confirme seu email
4. Acesse: https://www.football-data.org/client/register
5. Copie sua API key
6. Cole no `.env.local`: `FOOTBALL_DATA_API_KEY=sua_chave_aqui`

**Plano gratuito:** 10 requisições/minuto
**Plano pago:** €29/mês para acesso completo

### APIFootball (OPCIONAL)
1. Acesse: https://rapidapi.com/api-sports/api/api-football
2. Crie conta no RapidAPI
3. Subscreva ao plano desejado
4. Copie sua X-RapidAPI-Key
5. Cole no `.env.local`: `API_FOOTBALL_KEY=sua_chave_aqui`

### SportMonks (PREMIUM)
1. Acesse: https://www.sportmonks.com/
2. Crie conta e escolha plano premium
3. Copie sua API key do painel
4. Cole no `.env.local`: `SPORTMONKS_API_KEY=sua_chave_aqui`

## ✅ Testando a Configuração

### 1. Reiniciar o servidor
```bash
npm run dev
```

### 2. Testar as APIs
Acesse: http://localhost:3000/api/test-validation

Você deve ver algo como:
```json
{
  "success": true,
  "results": [
    {"name": "TheSportsDB", "isValid": true},
    {"name": "FootballData", "isValid": true},
    {"name": "APIFootball", "isValid": false, "error": "Token não configurado"},
    {"name": "SportMonks", "isValid": false, "error": "Token não configurado"}
  ]
}
```

### 3. Testar as predições
Acesse: http://localhost:3000/predicoes

Deve carregar jogos sem erros de "fetch failed".

## 🔍 Resolução de Problemas

### Erro: "fetch failed"
**Causa:** `NEXT_PUBLIC_APP_URL` não configurada
**Solução:** Adicione `NEXT_PUBLIC_APP_URL=http://localhost:3000` no `.env.local`

### Erro: "No fixtures found"
**Causa:** Nenhuma API configurada ou todas falharam
**Solução:** Configure pelo menos uma API key (FootballData recomendada)

### Erro: "Rate limit exceeded"
**Causa:** Muitas requisições para API gratuita
**Solução:** Aguarde ou configure API paga

### Arquivo .env.local não está sendo lido
**Causa:** Arquivo no local errado ou servidor não reiniciado
**Solução:** 
1. Certifique-se que `.env.local` está na raiz do projeto
2. Reinicie o servidor: `Ctrl+C` → `npm run dev`

## 📊 Estratégia Recomendada

### Para Desenvolvimento
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Apenas TheSportsDB (gratuita) já funciona bem
```

### Para Produção
```bash
NEXT_PUBLIC_APP_URL=https://sua-app.vercel.app
FOOTBALL_DATA_API_KEY=sua_chave_real
# Adicione outras APIs conforme necessário
```

## 🎯 Próximos Passos

1. ✅ Criar `.env.local`
2. ✅ Configurar `NEXT_PUBLIC_APP_URL`
3. ✅ Testar localmente
4. ✅ Configurar no Vercel
5. ✅ Fazer deploy
6. 🔄 Monitorar logs e performance

---

**Importante:** Nunca commite o arquivo `.env.local` no Git. Ele já está no `.gitignore` para sua segurança. 