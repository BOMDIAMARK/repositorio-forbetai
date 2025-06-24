#!/usr/bin/env node

// Script para testar a API SportMonks
// Uso: node scripts/test-sportmonks-api.js

// Ler variáveis de ambiente do sistema ou valores hardcoded para teste
const API_BASE_URL = process.env.SPORTMONKS_BASE_URL || "https://api.sportmonks.com/v3"
const API_KEY = process.env.SPORTMONKS_API_KEY || "x2lJeUGMXMuBA8BjGUU8Kg3rixtFJDFHCtLlntHuYYW9yL7cIl4fa4zTXfER"

console.log('🧪 Iniciando teste da API SportMonks...\n')

// Função para fazer requisição de teste
async function testRequest(endpoint, description) {
  console.log(`📡 Testando: ${description}`)
  console.log(`🔗 Endpoint: ${endpoint}`)
  
  if (!API_KEY) {
    console.error('❌ API_KEY não configurada!')
    return false
  }
  
  const url = `${API_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_token=${API_KEY}`
  
  try {
    console.log(`🚀 Fazendo requisição...`)
    const response = await fetch(url)
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    console.log(`📦 Content-Type: ${response.headers.get('content-type')}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Erro: ${errorText}`)
      return false
    }
    
    const data = await response.json()
    
    // Log da estrutura da resposta
    console.log(`📋 Estrutura da resposta:`)
    console.log(`   - Tem 'data': ${!!data.data}`)
    console.log(`   - Tipo de 'data': ${Array.isArray(data.data) ? 'array' : typeof data.data}`)
    console.log(`   - Tamanho (se array): ${Array.isArray(data.data) ? data.data.length : 'N/A'}`)
    console.log(`   - Chaves principais: ${Object.keys(data).join(', ')}`)
    
    if (data.meta) {
      console.log(`   - Meta info:`, {
        current_page: data.meta.current_page,
        per_page: data.meta.per_page,
        total: data.meta.total
      })
    }
    
    console.log('✅ Teste bem-sucedido!\n')
    return true
    
  } catch (error) {
    console.error(`❌ Erro na requisição: ${error.message}`)
    return false
  }
}

// Função principal de teste
async function runTests() {
  console.log('🔍 Verificando configuração...')
  console.log(`📍 Base URL: ${API_BASE_URL}`)
  console.log(`🔑 API Key: ${API_KEY ? `${API_KEY.substring(0, 8)}...` : 'NÃO CONFIGURADA'}`)
  console.log('')
  
  if (!API_KEY) {
    console.error('❌ SPORTMONKS_API_KEY não está configurada!')
    console.error('📝 Para configurar:')
    console.error('1. Crie um arquivo .env.local na raiz do projeto')
    console.error('2. Adicione: SPORTMONKS_API_KEY=sua_chave_aqui')
    console.error('3. Adicione: SPORTMONKS_BASE_URL=https://api.sportmonks.com/v3')
    process.exit(1)
  }
  
  const today = new Date().toISOString().slice(0, 10)
  
  const tests = [
    {
      endpoint: '/football/leagues?per_page=3',
      description: 'Listar ligas disponíveis (teste básico)'
    },
    {
      endpoint: `/football/fixtures/between/${today}/${today}?include=participants&per_page=3`,
      description: `Buscar fixtures de hoje (${today}) com participants`
    },
    {
      endpoint: `/football/fixtures/between/${today}/${today}?include=participants,scores&per_page=3`,
      description: `Buscar fixtures de hoje (${today}) com participants e scores`
    }
  ]
  
  let passedTests = 0
  
  for (const test of tests) {
    const success = await testRequest(test.endpoint, test.description)
    if (success) passedTests++
    
    // Pausa entre testes para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log(`\n📊 Resultado dos testes: ${passedTests}/${tests.length} passaram`)
  
  if (passedTests === tests.length) {
    console.log('🎉 Todos os testes passaram! A API SportMonks está funcionando corretamente.')
    console.log('✅ Os includes estão corretos para a v3')
    console.log('✅ Você pode prosseguir com confiança!')
  } else if (passedTests > 0) {
    console.log('⚠️ Alguns testes falharam, mas a API está parcialmente funcional.')
    console.log('   - Verifique se sua conta tem permissões para todos os endpoints')
    console.log('   - Alguns endpoints podem não estar disponíveis no seu plano')
  } else {
    console.log('❌ Todos os testes falharam. Verifique:')
    console.log('   - Se sua chave de API está válida')
    console.log('   - Se você tem permissões para os endpoints testados')
    console.log('   - Se sua conta SportMonks está ativa')
  }
}

// Executar os testes
runTests().catch(console.error) 