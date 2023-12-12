import { EscrowFinish } from "xrpl"
import { TransactionProps } from "../models"

export const finishEscrow = ({ txn, client, wallet }: TransactionProps<EscrowFinish>) => {
  console.log("Finish an Escrow")

  const escrowResponse = client.submitAndWait(txn, { autofill: true, wallet })

  console.log(escrowResponse)

  return escrowResponse
}
