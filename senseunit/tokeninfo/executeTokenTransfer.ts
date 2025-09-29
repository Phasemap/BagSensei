import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL 
} from "@solana/web3.js"

export interface TransferRequest {
  sender: Keypair
  recipient: string
  amountLamports: number
  memo?: string
}

/**
 * Executes a SOL transfer between two accounts with optional memo
 */
export async function executeTokenTransfer(
  connection: Connection,
  request: TransferRequest
): Promise<string> {
  const toPubkey = new PublicKey(request.recipient)

  const ix = SystemProgram.transfer({
    fromPubkey: request.sender.publicKey,
    toPubkey,
    lamports: request.amountLamports,
  })

  const tx = new Transaction().add(ix)

  // optional memo as extra instruction
  if (request.memo) {
    const memoIx = {
      keys: [],
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: Buffer.from(request.memo),
    }
    tx.add(memoIx as any)
  }

  const signature = await connection.sendTransaction(tx, [request.sender])
  await connection.confirmTransaction(signature, "confirmed")
  return signature
}

/**
 * Helper to convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return sol * LAMPORTS_PER_SOL
}

/**
 * Validates if the recipient address is valid
 */
export function validateRecipient(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}
