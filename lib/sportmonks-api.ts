export function getCurrentMinute(fixture: import("@/app/(platform)/ao-vivo/types").LiveScoreFixture): string | null {
  if (!fixture.state || fixture.state.developer_name !== "LIVE" || !fixture.periods) {
    return fixture.state?.short_name || null
  }

  const currentPeriod = fixture.periods.find((p) => p.ticking === true)
  if (!currentPeriod || typeof currentPeriod.started !== "number") {
    return fixture.state?.short_name || null
  }

  const nowInSeconds = Math.floor(Date.now() / 1000)
  const periodStartedInSeconds = currentPeriod.started
  const elapsedSecondsInPeriod = nowInSeconds - periodStartedInSeconds

  // Ajustar para o tempo que o período conta (ex: 2º tempo começa em 45')
  const countsFromMinutes = currentPeriod.counts_from || 0
  let currentMinute = countsFromMinutes + Math.floor(elapsedSecondsInPeriod / 60)

  // Limitar ao tempo máximo do período (ex: 45 min para 1º tempo, 90 min para 2º tempo)
  // Esta lógica pode precisar de mais refinamento com base nos dados de `period.type`
  if (currentPeriod.type_id === 1 && currentMinute > 45) currentMinute = 45 // 1st Half
  if (currentPeriod.type_id === 2 && currentMinute > 90) currentMinute = 90 // 2nd Half
  // Adicionar lógica para acréscimos se a API fornecer essa informação

  return `${currentMinute}'`
}
