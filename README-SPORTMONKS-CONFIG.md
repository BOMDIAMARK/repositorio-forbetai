# Configuração da API SportMonks

## Problema Identificado
A API do SportMonks não está funcionando porque as variáveis de ambiente não estão configuradas.

## Erro Encontrado
```
Error in fetchFixturesByDate: Error: SportMonks API key is not configured.
```

## Como Resolver

### 1. Obter Chave da API SportMonks
1. Acesse [SportMonks.com](https://www.sportmonks.com/)
2. Crie uma conta ou faça login
3. Acesse o painel de controle
4. Obtenha sua API key

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com:

```env
SPORTMONKS_API_KEY=sua_chave_api_aqui
SPORTMONKS_BASE_URL=https://api.sportmonks.com/v3
```

### 3. Verificar Configuração
Execute o seguinte comando para testar:
```bash
npm run build
```

## Estrutura da API Atual

### Endpoints Implementados:
- `fetchFixturesByDate(date)` - Busca fixtures por data
- `fetchFixtureDetails(fixtureId)` - Busca detalhes de uma fixture específica

### Includes Utilizados:
- Para fixtures: `league,participants,scores`
- Para detalhes: `league,participants,scores,statistics,periods,odds`

## Problemas Potenciais Identificados

### 1. Variáveis de Ambiente Não Configuradas
**Status**: ❌ CRÍTICO
**Solução**: Configurar `.env.local`

### 2. Rate Limiting
**Status**: ⚠️ POSSÍVEL
**Solução**: Implementar retry logic e caching

### 3. Plano da API
**Status**: ⚠️ VERIFICAR
**Alguns includes podem não estar disponíveis dependendo do plano**

## Próximos Passos
1. Configure as variáveis de ambiente
2. Teste a API com uma requisição simples
3. Verifique os limites do seu plano SportMonks
4. Considere implementar cache para reduzir calls à API 