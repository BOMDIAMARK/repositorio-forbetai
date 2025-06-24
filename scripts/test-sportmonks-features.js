#!/usr/bin/env node

/**
 * Script para testar as novas funcionalidades da SportMonks API
 * Uso: node scripts/test-sportmonks-features.js [feature] [date]
 */

const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

async function testFeature(feature = 'all', date = null) {
  const today = new Date().toISOString().split('T')[0]
  const testDate = date || today
  
  console.log('🧪 Testando funcionalidades SportMonks...')
  console.log(`📅 Data: ${testDate}`)
  console.log(`🎯 Feature: ${feature}`)
  console.log('─'.repeat(50))

  try {
    const url = `${baseUrl}/api/sportmonks/test-features?feature=${feature}&date=${testDate}`
    console.log(`🔗 URL: ${url}`)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const result = await response.json()
    
    // Exibir resultados
    console.log('\n📊 Resultados dos Testes:')
    console.log('─'.repeat(30))
    
    // Status da API
    const apiStatus = result.test_info?.api_status
    console.log(`🔑 API Key: ${apiStatus?.has_api_key ? '✅ Configurada' : '❌ Não configurada'}`)
    console.log(`🌐 Base URL: ${apiStatus?.base_url || 'Não definida'}`)
    
    // Status do Cache
    const cacheStatus = result.cache_status
    console.log(`💾 Cache: ${cacheStatus?.connected ? '✅' : '❌'} (${cacheStatus?.type || 'Unknown'})`)
    
    console.log('\n🎯 Testes Executados:')
    console.log('─'.repeat(25))
    
    // Resultados por feature
    for (const [featureName, featureResult] of Object.entries(result.results || {})) {
      const statusIcon = getStatusIcon(featureResult.status)
      console.log(`${statusIcon} ${featureName.toUpperCase()}: ${featureResult.status}`)
      
      if (featureResult.status === 'success') {
        if (featureResult.count !== undefined) {
          console.log(`   📊 Quantidade: ${featureResult.count}`)
        }
        if (featureResult.odds_count !== undefined) {
          console.log(`   💰 Odds: ${featureResult.odds_count} (${featureResult.bookmaker_count} casas)`)
        }
        if (featureResult.has_predictions !== undefined) {
          console.log(`   🔮 Predições: ${featureResult.has_predictions ? 'Disponíveis' : 'Não disponíveis'}`)
        }
      } else if (featureResult.status === 'error') {
        console.log(`   ❌ Erro: ${featureResult.error}`)
      } else if (featureResult.status === 'no_data') {
        console.log(`   ℹ️ Sem dados disponíveis`)
      }
      
      if (featureResult.cache_key) {
        console.log(`   🔑 Cache: ${featureResult.cache_key}`)
      }
    }
    
    // Resumo
    const summary = result.summary
    if (summary) {
      console.log('\n📈 Resumo:')
      console.log('─'.repeat(15))
      console.log(`✅ Sucessos: ${summary.successful_tests}/${summary.total_tests}`)
      console.log(`❌ Falhas: ${summary.failed_tests}`)
      console.log(`⏭️ Pulados: ${summary.skipped_tests}`)
      console.log(`ℹ️ Sem dados: ${summary.no_data_tests}`)
    }
    
    // Recomendações
    if (result.recommendations?.length > 0) {
      console.log('\n💡 Recomendações:')
      console.log('─'.repeat(20))
      result.recommendations.forEach(rec => console.log(`   ${rec}`))
    }
    
    // Cache performance (se testado)
    if (result.results.cache?.status === 'success') {
      const cache = result.results.cache
      console.log('\n⚡ Performance do Cache:')
      console.log('─'.repeat(25))
      console.log(`   ✍️ Escrita: ${cache.write_time_ms}ms`)
      console.log(`   📖 Leitura: ${cache.read_time_ms}ms`)
      console.log(`   🔍 Integridade: ${cache.data_integrity ? '✅' : '❌'}`)
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Dica: Verifique se o servidor está rodando:')
      console.log('   npm run dev')
    }
    
    if (error.message.includes('404')) {
      console.log('\n💡 Dica: Endpoint pode não estar implementado ainda')
    }
    
    process.exit(1)
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'success': return '✅'
    case 'error': return '❌'
    case 'no_data': return 'ℹ️'
    case 'skipped': return '⏭️'
    default: return '❓'
  }
}

// Executar script
const feature = process.argv[2] || 'all'
const date = process.argv[3]

console.log('🚀 SportMonks API Feature Tester')
console.log('═'.repeat(50))

testFeature(feature, date).then(() => {
  console.log('\n🎉 Teste concluído!')
  console.log('\n📚 Uso:')
  console.log('  node scripts/test-sportmonks-features.js              # Teste completo')
  console.log('  node scripts/test-sportmonks-features.js fixtures     # Apenas fixtures')
  console.log('  node scripts/test-sportmonks-features.js odds         # Apenas odds')
  console.log('  node scripts/test-sportmonks-features.js predictions  # Apenas predições')
  console.log('  node scripts/test-sportmonks-features.js all 2024-01-15  # Data específica')
})

// Polyfill para fetch em Node.js mais antigo
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch')
} 