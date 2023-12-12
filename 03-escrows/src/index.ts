import dayjs from "dayjs"
import { Client, isoTimeToRippleTime, xrpToDrops } from "xrpl"
import { generateConditionAndFulfillment, sleep } from "./helpers"
import { createEscrow, finishEscrow } from "./transactions"

// https://xrpl.org/public-servers.html#public-servers
const TESTNET_RIPPLE = "wss://s.altnet.rippletest.net:51233"
const TESTNET_XRPLLABS = "wss://testnet.xrpl-labs.com"
const DEVNET_RIPPLE = "wss://s.devnet.rippletest.net:51233"

const main = async () => {
  const client = new Client(TESTNET_RIPPLE)

  await client.connect()

  /**
   * Step 1 - Create the wallets
   */
  const { wallet: walletOne } = await client.fundWallet()
  const { wallet: walletTwo } = await client.fundWallet()

  console.log({ walletOne, walletTwo })

  /**
   * Step 2 - Create the escrow
   */

  // Time after which the destination user can claim the funds
  const WAITING_TIME = 10 // seconds

  // Define the time from when the Destination wallet can claim the money in the escrow. So here it would be 10 seconds after the escrow creation.
  const finishAfter = dayjs().add(WAITING_TIME, "seconds").toISOString()

  // Generate the condition and fulfillment
  const { condition, fulfillment } = generateConditionAndFulfillment()

  const escrowCreateResponse = await createEscrow({
    txn: {
      Account: walletOne.address,
      TransactionType: "EscrowCreate",
      Amount: xrpToDrops("1"),
      Destination: walletTwo.address,
      FinishAfter: isoTimeToRippleTime(finishAfter),
      Condition: condition,
    },
    client,
    wallet: walletOne,
  })

  // We need the sequence to finish an escrow, if it is not there, stop the function
  if (!escrowCreateResponse.result.Sequence) {
    await client.disconnect()
    return
  }

  /**
   * Step 3 - Finish the escrow
   */

  // Wait "WAITING_TIME" seconds before finishing the escrow
  console.log(`Waiting ${WAITING_TIME} seconds`)
  await sleep(WAITING_TIME * 1000)

  await finishEscrow({
    txn: {
      Account: walletTwo.address,
      TransactionType: "EscrowFinish",
      Condition: condition,
      Fulfillment: fulfillment,
      OfferSequence: escrowCreateResponse.result.Sequence,
      Owner: walletOne.address,
    },
    client,
    wallet: walletTwo, // Make sure this is the wallet which was in the "Destination" field during the escrow creation
  })

  await client.disconnect()
}

main()
