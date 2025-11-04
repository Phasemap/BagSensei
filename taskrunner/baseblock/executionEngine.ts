import { Connection, PublicKey, ParsedTransactionWithMeta } from "@solana/web3.js"
import { decodeTransactionData } from "../utils/decodeTx"

export async function executeTokenScanTask(
  connection: Connection,
  tokenMint: string
): Promise<{ success: boolean; slotsScanned: number; decoded: number }> {
  const mint = new PublicKey(tokenMint)
  const signatures = await connection.getSignaturesForAddress(mint, { limit: 100 })
  let slotsScanned = 0
  let decoded = 0

  for (const sig of signatures) {
    const tx: ParsedTransactionWithMeta | null = await connection.getTransaction(sig.signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0
    })

    if (!tx || !tx.transaction?.message) continue

    try {
      decodeTransactionData(tx.transaction.message)
      decoded++
    } catch (err) {
      console.error(`Decode failed for ${sig.signature}:`, err)
    }

    slotsScanned++
  }

  return { success: true, slotsScanned, decoded }
}
