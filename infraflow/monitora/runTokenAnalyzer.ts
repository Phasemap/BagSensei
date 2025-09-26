import { PublicKey, Connection } from "@solana/web3.js"

export async function analyzeToken(
  connection: Connection,
  tokenMint: string
): Promise<Record<string, any>> {
  const mint = new PublicKey(tokenMint)
  
  // Fetch the largest token accounts
  const tokenAccounts = await connection.getTokenLargestAccounts(mint)
  const holders = tokenAccounts.value.length

  // Retrieve parsed account info for the token mint
  const supplyInfo = await connection.getParsedAccountInfo(mint)
  const decimals = supplyInfo.value?.data?.parsed?.info?.decimals ?? 0

  // Return the token analysis data
  return {
    mint: tokenMint,
    topHolders: holders,
    decimals
  }
}
