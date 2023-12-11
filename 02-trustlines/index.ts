import { AccountSet, AccountSetAsfFlags, Client, Payment, TrustSet } from "xrpl"
import { convertCurrencyCode, getExplorerType, isTxnSuccessful } from "./helpers"

// https://xrpl.org/public-servers.html#public-servers
const TESTNET_RIPPLE = "wss://s.altnet.rippletest.net:51233"
const TESTNET_XRPLLABS = "wss://testnet.xrpl-labs.com"
const DEVNET_RIPPLE = "wss://s.devnet.rippletest.net:51233"

// The custom token the issuer will mint and that the user account will hold
const TOKEN = "IRON_MAN"

const main = async () => {
  const client = new Client(DEVNET_RIPPLE)

  // Connect the client to the network
  await client.connect()

  // Create the issuer and user wallets using the fundWallet function
  const { wallet: issuerWallet } = await client.fundWallet()
  const { wallet: userWallet } = await client.fundWallet()

  // Print the two wallets so you can get the public address starting with "r..."
  console.log({ issuerWallet, userWallet })
  console.log()

  /**
   * Step 1a - Allow Rippling on the issuer account.
   * This will allow multiple users holding "IRON_MAN" to send it to each other.
   */
  console.log("Sending the AccountSet to enable Rippling on the issuer account...")

  const accountSet: AccountSet = {
    Account: issuerWallet.address,
    TransactionType: "AccountSet",
    SetFlag: AccountSetAsfFlags.asfDefaultRipple,
  }
  console.log(accountSet)

  /**
   * Step 1b - Submit the AccountSet transaction to the ledger
   */
  const accountSetResponse = await client.submitAndWait(accountSet, {
    // Add necessary fields such as Fee or LastLedgerSequence
    autofill: true,
    // Define the wallet which contains the private key to sign the AccountSet transaction
    wallet: issuerWallet,
  })

  console.log(accountSetResponse)
  console.log()

  // Check the result (optional but recommended), if it is not successful, stop the function
  if (!isTxnSuccessful(accountSetResponse)) {
    await client.disconnect()
    return
  }

  /**
   * Step 2a - Create trustline from the user account to the issuer account.
   * Your user account will trust the issuer account and accept to hold and receive "IRON_MAN".
   */
  console.log("Sending the TrustSet from the user to the issuer account...")

  const trustset: TrustSet = {
    Account: userWallet.address,
    TransactionType: "TrustSet",
    LimitAmount: {
      issuer: issuerWallet.address,
      // https://xrpl.org/currency-formats.html#currency-codes
      // Tokens with more than 3 characters must be encoded
      currency: convertCurrencyCode(TOKEN),
      // The maximum amount (not in drops) userAccount accepts to hold/receive
      value: "1000000", // One million IRON_MAN
    },
  }

  /**
   * Step 2b - Submit the Trustset transaction to the ledger
   */
  const trustsetResponse = await client.submitAndWait(trustset, {
    // Add necessary fields such as Fee or LastLedgerSequence
    autofill: true,
    // Define the wallet which contains the private key to sign the Trustset transaction
    wallet: userWallet,
  })

  console.log(trustsetResponse)
  console.log()

  // Check the result (optional but recommended), if it is not successful, stop the function
  if (!isTxnSuccessful(trustsetResponse)) {
    await client.disconnect()
    return
  }

  /**
   * Step 3a - Send 1000 IRON_MAN tokens from the issuer to the user wallet
   */
  const payment: Payment = {
    Account: issuerWallet.address,
    TransactionType: "Payment",
    Destination: userWallet.address,
    Amount: {
      issuer: issuerWallet.address,
      currency: convertCurrencyCode(TOKEN),
      value: "1000",
    },
  }

  /**
   * Step 3b - Submit the Payment transaction to the ledger
   */
  const paymentResponse = await client.submitAndWait(payment, {
    // Add necessary fields such as Fee or LastLedgerSequence
    autofill: true,
    // Define the wallet which contains the private key to sign the payment transaction
    wallet: issuerWallet,
  })

  console.log(paymentResponse)
  console.log()
  console.log(
    `Issuer details: https://${getExplorerType(client.url)}.xrpl.org/accounts/${
      issuerWallet.address
    }`,
  )
  console.log(
    `User details: https://${getExplorerType(client.url)}.xrpl.org/accounts/${userWallet.address}`,
  )

  await client.disconnect()
}

main()
