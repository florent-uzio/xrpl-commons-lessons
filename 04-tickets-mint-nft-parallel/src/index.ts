import { Client, NFTokenMint, NFTokenMintFlags, TicketCreate, convertStringToHex } from "xrpl"
import { Ticket } from "xrpl/dist/npm/models/ledger"

// https://xrpl.org/public-servers.html#public-servers
const TESTNET_RIPPLE = "wss://s.altnet.rippletest.net:51233"
const TESTNET_XRPLLABS = "wss://testnet.xrpl-labs.com"
const DEVNET_RIPPLE = "wss://s.devnet.rippletest.net:51233"

const main = async () => {
  const client = new Client(TESTNET_RIPPLE)

  await client.connect()

  // Create wallet
  const { wallet: minterWallet } = await client.fundWallet()
  console.log("**** Wallet created ****")
  console.log(minterWallet)

  /**
   * Step 1 - Create tickets
   */
  const ticketCreate: TicketCreate = {
    Account: minterWallet.address,
    TransactionType: "TicketCreate",
    TicketCount: 30,
  }

  const response = await client.submitAndWait(ticketCreate, {
    autofill: true,
    wallet: minterWallet,
  })

  console.log(response)

  /**
   * Step 2 - Mint {{ TOTAL_MINT }} NFTs in parallel
   */

  /**
   * Fetch the tickets available in the minter account.
   * https://xrpl.org/account_objects.html#account_objects
   */
  const ticketsResponse = await client.request({
    account: minterWallet.address,
    command: "account_objects",
    type: "ticket",
  })

  // More information about the Ticket object at https://xrpl.org/ticket.html#ticket
  const tickets = ticketsResponse.result.account_objects as Ticket[]

  console.log()
  console.log("**** Tickets available in the minter wallet ****")
  console.log(JSON.stringify(tickets, null, 2))

  const nftMintsPromises = tickets.map((ticket) => {
    const nftMint: NFTokenMint = {
      Account: minterWallet.address,
      TransactionType: "NFTokenMint",
      URI: convertStringToHex(
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWRrYmw0c3hjNGo2bzFmMmZuZnB1Y2NwM2k4YWhjcHE4MzkwdjZhbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/GlWeBb6U3R1PpjH9VV/giphy.gif",
      ),
      Flags: NFTokenMintFlags.tfTransferable, // Allows to create offers and sell the NFT to other wallets.
      NFTokenTaxon: 0,
      TicketSequence: ticket.TicketSequence,
      Sequence: 0, // Make sure to set the Sequence to 0
    }

    return client.submitAndWait(nftMint, { autofill: true, wallet: minterWallet })
  })

  const mints = await Promise.all(nftMintsPromises)

  console.log()
  console.log(JSON.stringify(mints, null, 2))

  await client.disconnect()
}

main()
