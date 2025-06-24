# SportMonks API - Funcionalidades Avançadas

## 🚀 Funcionalidades Implementadas

### 1. Predições Reais (SportMonks Algorithm)
- **Endpoint**: `/api/sportmonks/predictions` e `/api/sportmonks/predictions/[fixtureId]`
- **Funcionalidades**:
  - Algoritmos profissionais da SportMonks
  - Probabilidades de resultado (1X2)
  - Predições de gols (Over/Under)
  - Both Teams to Score (BTTS)
  - Placar correto mais provável
  - Nível de confiança do algoritmo
  - Versão do modelo de IA usado

### 2. Odds Reais de Múltiplas Casas
- **Endpoint**: `/api/sportmonks/odds/[fixtureId]`
- **Funcionalidades**:
  - Odds de múltiplas casas de apostas
  - Comparação automática das melhores odds
  - Análise de margem das casas
  - Odds em formatos decimais, fracionais e americanos
  - Mercados: 1X2, BTTS, Over/Under, Handicap Asiático
  - Cache otimizado para atualizações frequentes

### 3. Dados Enriquecidos Completos
- **Endpoint**: `/api/sportmonks/enriched/[fixtureId]`
- **Funcionalidades**:
  - Logos oficiais de times e ligas
  - Estatísticas detalhadas da partida
  - Informações do estádio/venue
  - Lineups e formações
  - Dados históricos dos times
  - Score de completude dos dados
  - Múltiplas fontes de dados

### 4. Cache Otimizado e Performance
- **Sistema de Cache Multi-Camada**:
  - Redis Cloud (produção)
  - Redis Upstash (backup)
  - Cache em memória (desenvolvimento)
  - TTLs diferenciados por tipo de dado
  - Invalidação inteligente de cache

### 5. Credibilidade e Qualidade de Dados
- **Métricas de Qualidade**:
  - Score de completude (0-100%)
  - Fonte profissional verificada
  - Timestamp de última atualização
  - Número de casas de apostas
  - Nível de confiança das predições

## 📊 Estrutura de Dados

### Predições (Predictions)
```json
{
  "fixture_id": 12345,
  "algorithm_predictions": {
    "match_winner": {
      "home_win_probability": 0.45,
      "draw_probability": 0.30,
      "away_win_probability": 0.25,
      "most_likely": {
        "outcome": "home_win",
        "probability": 0.45
      }
    },
    "goals": {
      "over_2_5_probability": 0.65,
      "under_2_5_probability": 0.35,
      "both_teams_score_probability": 0.70
    }
  },
  "confidence_metrics": {
    "overall_confidence": 0.85,
    "data_quality": 0.92,
    "model_version": "v2.1"
  }
}
```

### Odds Detalhadas
```json
{
  "fixture_id": 12345,
  "best_odds": {
    "fullTimeResult": {
      "home": 2.10,
      "draw": 3.40,
      "away": 3.20
    }
  },
  "bookmakers": [
    {
      "id": "bet365",
      "name": "Bet365",
      "logo": "https://...",
      "markets": [...]
    }
  ],
  "market_analysis": {
    "margin_percentage": 5.2,
    "bookmaker_count": 15
  }
}
```

### Dados Enriquecidos
```json
{
  "fixture_info": {
    "id": 12345,
    "name": "Real Madrid vs Barcelona",
    "starting_at": "2024-01-15T20:00:00Z"
  },
  "teams": [
    {
      "id": 1,
      "name": "Real Madrid",
      "logo": "https://...",
      "founded": 1902,
      "venue_id": 123
    }
  ],
  "venue": {
    "name": "Santiago Bernabéu",
    "capacity": 81044,
    "coordinates": {...}
  },
  "statistics": {...},
  "data_quality": {
    "completeness_score": 95.5,
    "enrichment_level": "premium"
  }
}
```

## 🔧 Cache Configuration

### TTL por Tipo de Dado
- **Odds**: 10 minutos (dados voláteis)
- **Predições**: 30 minutos (algoritmos estáveis)
- **Dados Enriquecidos**: 1 hora (dados estruturais)
- **Fixtures**: 10 minutos (scores mudam)

### Headers de Cache
```
Cache-Control: public, max-age=600
X-Cache-TTL: 600
X-Cache-Provider: Redis Cloud
```

## 🚀 Performance Improvements

1. **Parallel API Calls**: Múltiplas requisições simultâneas
2. **Smart Caching**: Cache diferenciado por tipo de dado
3. **Data Compression**: Resposta otimizada
4. **Error Handling**: Fallbacks e retry logic
5. **Rate Limiting**: Respeito aos limites da API

## 📈 Monitoring e Analytics

- Logs detalhados de performance
- Métricas de cache hit/miss
- Tracking de qualidade de dados
- Monitoramento de rate limits
- Alertas de falhas da API 