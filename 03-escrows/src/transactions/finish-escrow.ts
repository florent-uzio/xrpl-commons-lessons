import { EscrowFinish } from "xrpl"
import { TransactionProps } from "../models"

export const finishEscrow = async ({ txn, client, wallet }: TransactionProps<EscrowFinish>) => {
  console.log()
  console.log("Finish an Escrow")

  const escrowResponse = await client.submitAndWait(txn, { autofill: true, wallet })

  console.log(JSON.stringify(escrowResponse, null, 2))

  return escrowResponse
}
