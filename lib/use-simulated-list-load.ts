'use client'

import { useCallback, useEffect, useState } from 'react'

/** Задержка, чтобы loading state был заметен (V3 демо). */
const SIMULATED_LIST_DELAY_MS = 1400

export type SimulatedListPhase = 'loading' | 'ready' | 'error'

export function useSimulatedListLoad(shouldFail: boolean) {
  const [phase, setPhase] = useState<SimulatedListPhase>('loading')
  const [loadToken, setLoadToken] = useState(0)

  useEffect(() => {
    setPhase('loading')
    const id = window.setTimeout(() => {
      setPhase(shouldFail ? 'error' : 'ready')
    }, SIMULATED_LIST_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [shouldFail, loadToken])

  const retryLoad = useCallback(() => {
    setLoadToken((n) => n + 1)
  }, [])

  return { phase, retryLoad }
}
