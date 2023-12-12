import { Client, Transaction, Wallet } from "xrpl"

export type TransactionProps<T extends Transaction> = {
  txn: T
  client: Client
  wallet: Wallet
}
