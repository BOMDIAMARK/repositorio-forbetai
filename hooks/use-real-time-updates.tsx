"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseRealTimeUpdatesOptions {
  endpoint: string
  interval?: number
  enabled?: boolean
  dependencies?: any[]
}

interface UpdateStatus {
  lastUpdated: Date | null
  isUpdating: boolean
  updateCount: number
  error: string | null
}

export function useRealTimeUpdates<T>(options: UseRealTimeUpdatesOptions) {
  const {
    endpoint,
    interval = 30000, // 30 seconds default
    enabled = true,
    dependencies = []
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<UpdateStatus>({
    lastUpdated: null,
    isUpdating: false,
    updateCount: 0,
    error: null
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async (isInitial = false) => {
    if (!enabled) return

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      if (isInitial) {
        setLoading(true)
      } else {
        setStatus(prev => ({ ...prev, isUpdating: true, error: null }))
      }

      const response = await fetch(endpoint, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      setData(result)
      setError(null)
      
      setStatus(prev => ({
        lastUpdated: new Date(),
        isUpdating: false,
        updateCount: prev.updateCount + 1,
        error: null
      }))

    } catch (err: any) {
      if (err.name === 'AbortError') {
        return // Request was cancelled, ignore
      }

      const errorMessage = err.message || 'Erro ao atualizar dados'
      setError(errorMessage)
      setStatus(prev => ({
        ...prev,
        isUpdating: false,
        error: errorMessage
      }))

      console.warn(`Real-time update error for ${endpoint}:`, err)
    } finally {
      if (isInitial) {
        setLoading(false)
      }
    }
  }, [endpoint, enabled])

  const startPolling = useCallback(() => {
    if (!enabled || intervalRef.current) return

    intervalRef.current = setInterval(() => {
      fetchData(false)
    }, interval)
  }, [fetchData, interval, enabled])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const manualRefresh = useCallback(() => {
    fetchData(false)
  }, [fetchData])

  // Initial load and polling setup
  useEffect(() => {
    fetchData(true)
    if (enabled) {
      startPolling()
    }

    return () => {
      stopPolling()
    }
  }, [enabled, ...dependencies])

  // Handle visibility change - pause when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling()
      } else if (enabled) {
        // Refresh immediately when tab becomes visible
        fetchData(false)
        startPolling()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, fetchData, startPolling, stopPolling])

  return {
    data,
    loading,
    error,
    status,
    manualRefresh,
    startPolling,
    stopPolling
  }
}

// Specialized hook for live scores
export function useLiveScores() {
  return useRealTimeUpdates<any>({
    endpoint: '/api/live-scores',
    interval: 15000, // Update every 15 seconds for live scores
    enabled: true
  })
}

// Specialized hook for fixture updates
export function useFixtureUpdates(fixtureId: string | number) {
  return useRealTimeUpdates<any>({
    endpoint: `/api/analises/fixture/${fixtureId}`,
    interval: 30000, // Update every 30 seconds for fixture details
    enabled: !!fixtureId,
    dependencies: [fixtureId]
  })
}

// Specialized hook for predictions updates
export function usePredictionsUpdates(fixtureId: string | number) {
  return useRealTimeUpdates<any>({
    endpoint: `/api/sportmonks/predictions/${fixtureId}`,
    interval: 60000, // Update every minute for predictions (they change less frequently)
    enabled: !!fixtureId,
    dependencies: [fixtureId]
  })
} 