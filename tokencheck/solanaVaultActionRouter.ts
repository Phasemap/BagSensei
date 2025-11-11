import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js"
import { SolanaVaultAction, VaultActionType } from "./solanaVaultProcessor"

export interface VaultRequest {
  type: VaultActionType
  authority: PublicKey
  vault: PublicKey
  payload: Record<string, any>
}


export async function routeVaultAction(
  conn: Connection,
  req: VaultRequest
): Promise<Transaction> {
  if (!req.type || !req.authority || !req.vault) {
    throw new Error("Invalid vault request: missing required fields")
  }

  const tx = new Transaction()

  let instruction: TransactionInstruction

  try {
    switch (req.type) {
      case "DEPOSIT":
        instruction = await SolanaVaultAction.buildDepositInstruction(req)
        break
      case "WITHDRAW":
        instruction = await SolanaVaultAction.buildWithdrawInstruction(req)
        break
      case "REFRESH":
        instruction = await SolanaVaultAction.buildRefreshInstruction(req)
        break
      default:
        throw new Error(`Unsupported vault action: ${req.type}`)
    }

    tx.add(instruction)
    return tx
  } catch (err) {
    console.error("Vault action routing failed:", err)
    throw new Error(`Failed to build instruction for ${req.type}`)
  }
}
