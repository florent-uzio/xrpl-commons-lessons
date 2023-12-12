import { EscrowCancel } from "xrpl"
import { TransactionProps } from "../models"

export const cancelEscrow = async ({ txn, client, wallet }: TransactionProps<EscrowCancel>) => {
  console.log()
  console.log("Cancel an Escrow")

  const escrowResponse = await client.submitAndWait(txn, { autofill: true, wallet })

  console.log(JSON.stringify(escrowResponse, null, 2))

  return escrowResponse
}
