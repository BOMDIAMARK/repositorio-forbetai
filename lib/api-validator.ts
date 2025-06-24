// Sistema de validação de tokens das APIs para verificar se estão funcionando
export interface APIValidationResult {
  name: string
  isValid: boolean
  error?: string
  remainingQuota?: number
  status: 'success' | 'auth_error' | 'quota_exceeded' | 'unknown_error'
}

// Validador para APIFootball via RapidAPI
export async function validateAPIFootballToken(token: string): Promise<APIValidationResult> {
  try {
    const response = await fetch('https://v3.football.api-sports.io/status', {
      headers: {
        'X-RapidAPI-Key': token,
        'X-RapidAPI-Host': 'v3.football.api-sports.io'
      }
    })

    if (!response.ok) {
      return {
        name: 'APIFootball',
        isValid: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status === 401 ? 'auth_error' : 'unknown_error'
      }
    }

    const data = await response.json()
    
    // Verificar se há erros na resposta
    if (data.errors && Object.keys(data.errors).length > 0) {
      const errorKey = Object.keys(data.errors)[0]
      const errorMessage = data.errors[errorKey]
      
      return {
        name: 'APIFootball',
        isValid: false,
        error: `${errorKey}: ${errorMessage}`,
        status: errorKey === 'token' ? 'auth_error' : 'unknown_error'
      }
    }

    // Se chegou até aqui, o token é válido
    return {
      name: 'APIFootball',
      isValid: true,
      remainingQuota: data.response?.requests?.remaining,
      status: 'success'
    }

  } catch (error) {
    return {
      name: 'APIFootball',
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'unknown_error'
    }
  }
}

// Validador para FootballData
export async function validateFootballDataToken(token: string): Promise<APIValidationResult> {
  try {
    const response = await fetch('https://api.football-data.org/v4/competitions', {
      headers: {
        'X-Auth-Token': token
      }
    })

    if (!response.ok) {
      return {
        name: 'FootballData',
        isValid: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status === 401 ? 'auth_error' : 'unknown_error'
      }
    }

    const data = await response.json()
    
    return {
      name: 'FootballData',
      isValid: true,
      remainingQuota: parseInt(response.headers.get('X-RequestCounter-Remaining') || '0'),
      status: 'success'
    }

  } catch (error) {
    return {
      name: 'FootballData',
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'unknown_error'
    }
  }
}

// Validador para SportMonks
export async function validateSportMonksToken(token: string, baseUrl: string): Promise<APIValidationResult> {
  try {
    const response = await fetch(`${baseUrl}/core/me?api_token=${token}`)

    if (!response.ok) {
      return {
        name: 'SportMonks',
        isValid: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status === 401 ? 'auth_error' : 'unknown_error'
      }
    }

    const data = await response.json()
    
    if (data.error) {
      return {
        name: 'SportMonks',
        isValid: false,
        error: data.error,
        status: 'auth_error'
      }
    }

    return {
      name: 'SportMonks',
      isValid: true,
      status: 'success'
    }

  } catch (error) {
    return {
      name: 'SportMonks',
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'unknown_error'
    }
  }
}

// Função principal para validar todas as APIs configuradas
export async function validateAllAPIs(): Promise<APIValidationResult[]> {
  const results: APIValidationResult[] = []

  // TheSportsDB não precisa de token - sempre válida
  results.push({
    name: 'TheSportsDB',
    isValid: true,
    status: 'success'
  })

  // Validar APIFootball se configurada
  const apiFootballKey = process.env.API_FOOTBALL_KEY
  if (apiFootballKey) {
    const result = await validateAPIFootballToken(apiFootballKey)
    results.push(result)
  } else {
    results.push({
      name: 'APIFootball',
      isValid: false,
      error: 'Token não configurado',
      status: 'auth_error'
    })
  }

  // Validar FootballData se configurada
  const footballDataKey = process.env.FOOTBALL_DATA_API_KEY
  if (footballDataKey) {
    const result = await validateFootballDataToken(footballDataKey)
    results.push(result)
  } else {
    results.push({
      name: 'FootballData',
      isValid: false,
      error: 'Token não configurado',
      status: 'auth_error'
    })
  }

  // Validar SportMonks se configurada
  const sportMonksKey = process.env.SPORTMONKS_API_KEY
  const sportMonksUrl = process.env.SPORTMONKS_BASE_URL
  if (sportMonksKey && sportMonksUrl) {
    const result = await validateSportMonksToken(sportMonksKey, sportMonksUrl)
    results.push(result)
  } else {
    results.push({
      name: 'SportMonks',
      isValid: false,
      error: 'Token não configurado',
      status: 'auth_error'
    })
  }

  return results
}

// Utilitário para obter apenas APIs válidas
export function getValidAPIs(validationResults: APIValidationResult[]): string[] {
  return validationResults
    .filter(result => result.isValid)
    .map(result => result.name)
}

// Utilitário para log de status das APIs
export function logAPIStatus(validationResults: APIValidationResult[]): void {
  console.log('🔍 Status das APIs configuradas:')
  
  validationResults.forEach(result => {
    const status = result.isValid ? '✅' : '❌'
    const quota = result.remainingQuota ? `(${result.remainingQuota} restantes)` : ''
    const error = result.error ? `- ${result.error}` : ''
    
    console.log(`${status} ${result.name} ${quota} ${error}`)
  })
} 