import { EscrowCreate } from "xrpl"
import { TransactionProps } from "../models"

export const createEscrow = async ({ txn, client, wallet }: TransactionProps<EscrowCreate>) => {
  console.log("Create an Escrow")

  const escrowResponse = await client.submitAndWait(txn, { autofill: true, wallet })

  console.log(JSON.stringify(escrowResponse, null, 2))

  return escrowResponse
}
