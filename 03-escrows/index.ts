import { Client, xrpToDrops } from "xrpl"
import { createEscrow } from "./transactions"

// https://xrpl.org/public-servers.html#public-servers
const TESTNET_RIPPLE = "wss://s.altnet.rippletest.net:51233"
const TESTNET_XRPLLABS = "wss://testnet.xrpl-labs.com"
const DEVNET_RIPPLE = "wss://s.devnet.rippletest.net:51233"

const main = async () => {
  const client = new Client(TESTNET_RIPPLE)

  await client.connect()

  /**
   * Step 1 - Create the escrow
   */
  const { wallet: walletOne } = await client.fundWallet()
  const { wallet: walletTwo } = await client.fundWallet()

  const escrowCreateResponse = await createEscrow({
    txn: {
      Account: walletOne.address,
      TransactionType: "EscrowCreate",
      Amount: xrpToDrops("1"),
      Destination: walletTwo.address,
      //   FinishAfter:
    },
    client,
    wallet: walletOne,
  })

  await client.disconnect()
}
