interface TokenEvent {
  token: string
  wallet: string
  volume: number
}

// Group events by token
export function groupByToken(events: TokenEvent[]): Map<string, TokenEvent[]> {
  const map = new Map<string, TokenEvent[]>()
  
  // Loop through each event to group by token
  for (const evt of events) {
    if (!map.has(evt.token)) {
      map.set(evt.token, [])  // Initialize a new array for the token if it doesn't exist
    }
    map.get(evt.token)!.push(evt)  // Push the event into the corresponding token group
  }
  
  return map
}

// Summarize token clusters by summing up volumes for each token
export function summarizeTokenClusters(events: TokenEvent[]): Record<string, number> {
  const groups = groupByToken(events)  // Group events by token
  const summary: Record<string, number> = {}

  // Iterate over each token group to calculate the total volume
  for (const [token, group] of groups.entries()) {
    summary[token] = group.reduce((acc, e) => acc + e.volume, 0)  // Sum volumes for each token
  }

  return summary
}
