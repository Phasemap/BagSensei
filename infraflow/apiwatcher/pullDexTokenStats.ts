import axios from "axios"

export interface DexTokenStats {
  symbol: string
  name: string
  price: number
  priceChange24h: number
  volume24h: number
  liquidityUsd: number
  fdv?: number
  holders?: number
}

export async function fetchDexTokenStats(mintAddress: string): Promise<DexTokenStats | null> {
  const endpoint = `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`
  try {
    const response = await axios.get(endpoint)

    if (!response.data || !response.data.pairs || response.data.pairs.length === 0) {
      console.warn(`No trading pairs found for token: ${mintAddress}`)
      return null
    }

    const pair = response.data.pairs[0]

    return {
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
      price: parseFloat(pair.priceUsd),
      priceChange24h: pair.priceChange?.h24 ? parseFloat(pair.priceChange.h24) : 0,
      volume24h: pair.volume?.h24Usd ? parseFloat(pair.volume.h24Usd) : 0,
      liquidityUsd: pair.liquidity?.usd ? parseFloat(pair.liquidity.usd) : 0,
      fdv: pair.fdv ? parseFloat(pair.fdv) : undefined,
    }
  } catch (error) {
    console.error(`Error fetching token stats for ${mintAddress}`, error)
    return null
  }
}

export async function fetchMultipleTokensStats(mintAddresses: string[]): Promise<DexTokenStats[]> {
  const results: DexTokenStats[] = []
  for (const address of mintAddresses) {
    const stats = await fetchDexTokenStats(address)
    if (stats) results.push(stats)
  }
  return results
}
