
export const DEFAULT_SCAN_INTERVAL = 10 * 60 * 1000      
export const FLASH_ACTIVITY_WINDOW_MS = 5 * 60 * 1000    
export const MAX_LOOKBACK_DURATION_MS = 6 * 60 * 60 * 1000 // 6 hours max scan window

export const MAX_TX_LOOKBACK = 200                       // Max transactions to analyze per token
export const MIN_TX_COUNT_FOR_ANALYSIS = 15              // Avoid analysis if token has less activity

// Whale detection thresholds
export const MIN_WHALE_THRESHOLD = 10_000                // Min token units considered whale tx
export const WHALE_TX_BURST_WINDOW = 120_000             // 2 min interval to check whale clusters

// Token liquidity filtering
export const MIN_TOKEN_LIQUIDITY = 5_000                 // Skip analysis on illiquid tokens
export const MIN_MARKET_CAP_ESTIMATE = 25_000            // Optional cap-based filter

// Risk score logic
export const RISK_SCORE_ALERT_THRESHOLD = 0.85           // Trigger alert if score ≥ this
export const AUTOFLAG_FLASH_RISK = true                  // Flag tokens with strong short-term risk
export const MAX_SYBIL_RATIO = 0.3                       // Sybil % over total holders

// Alerting topics
export const ALERT_CHANNELS = {
  whaleMoves: "alerts/whales",
  suspiciousTokens: "alerts/tokens",
  flashPumps: "alerts/flash",
  sybilFlags: "alerts/sybils",
  contractIssues: "alerts/contracts"
} as const
