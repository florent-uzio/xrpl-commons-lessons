import { Client, NFTokenMint, NFTokenMintFlags, TicketCreate, convertStringToHex } from "xrpl"
import { Ticket } from "xrpl/dist/npm/models/ledger"

// https://xrpl.org/public-servers.html#public-servers
const TESTNET_RIPPLE = "wss://s.altnet.rippletest.net:51233"
const TESTNET_XRPLLABS = "wss://testnet.xrpl-labs.com"
const DEVNET_RIPPLE = "wss://s.devnet.rippletest.net:51233"

const main = async () => {
  const client = new Client(TESTNET_RIPPLE)

  await client.connect()

  const { wallet: minterWallet } = await client.fundWallet()

  console.log(minterWallet)

  const TOTAL_MINTS = 20

  /**
   * Step 1 - Create tickets
   */
  const ticketCreate: TicketCreate = {
    Account: minterWallet.address,
    TransactionType: "TicketCreate",
    TicketCount: TOTAL_MINTS,
  }

  const response = await client.submitAndWait(ticketCreate, {
    autofill: true,
    wallet: minterWallet,
  })

  console.log(response)

  /**
   * {
        "Account": "rain7iUZ7EmqeXa5z6pYbTsHNnBcmJEjit",
        "Flags": 0,
        "LedgerEntryType": "Ticket",
        "OwnerNode": "0",
        "PreviousTxnID": "35AA9842CA72E34B215A9C41D428C0E5F15E5A41D041D193EAD5BA8CA737CA1C",
        "PreviousTxnLgrSeq": 43736919,
        "TicketSequence": 43736920,
        "index": "E3BCBA6D2D8A534B1031C5F0B7C92A624F23E6FFD8F81DEB3778CFF21E3015FC"
      },
   */

  /**
   * Step 2 - Mint {{ TOTAL_MINT }} NFTs in parallel
   */

  //   Fetch the ticket sequences
  const ticketsResponse = await client.request({
    account: minterWallet.address,
    command: "account_objects",
    type: "ticket",
  })
  const tickets = ticketsResponse.result.account_objects as Ticket[]

  console.log("**** Tickets available in the minter wallet ****")
  console.log(JSON.stringify(tickets, null, 2))

  const nftMintsPromises = tickets.map((ticket) => {
    const nftMint: NFTokenMint = {
      Account: minterWallet.address,
      TransactionType: "NFTokenMint",
      URI: convertStringToHex(
        "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWRrYmw0c3hjNGo2bzFmMmZuZnB1Y2NwM2k4YWhjcHE4MzkwdjZhbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/GlWeBb6U3R1PpjH9VV/giphy.gif",
      ),
      Flags: NFTokenMintFlags.tfTransferable,
      NFTokenTaxon: 0,
      TicketSequence: ticket.TicketSequence,
      Sequence: 0,
    }
    // const { tx_blob } = minterWallet.sign(nftMint)
    return client.submit(nftMint, { autofill: true, wallet: minterWallet })
  })

  const mints = await Promise.all(nftMintsPromises)

  console.log()
  console.log(JSON.stringify(mints, null, 2))

  await client.disconnect()
}

main()
