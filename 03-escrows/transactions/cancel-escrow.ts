import { EscrowCancel } from "xrpl"
import { TransactionProps } from "../models"

export const cancelEscrow = ({ txn, client, wallet }: TransactionProps<EscrowCancel>) => {
  console.log("Cancel an Escrow")

  const escrowResponse = client.submitAndWait(txn, { autofill: true, wallet })

  console.log(escrowResponse)

  return escrowResponse
}
