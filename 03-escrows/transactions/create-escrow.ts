import { EscrowCreate } from "xrpl"
import { TransactionProps } from "../models"

export const createEscrow = ({ txn, client, wallet }: TransactionProps<EscrowCreate>) => {
  console.log("Create an Escrow")

  const escrowResponse = client.submitAndWait(txn, { autofill: true, wallet })

  console.log(escrowResponse)

  return escrowResponse
}
