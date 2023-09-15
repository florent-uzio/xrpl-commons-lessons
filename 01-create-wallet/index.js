import { Wallet, Client, ECDSA } from "xrpl"

/**
 * Generate a keypair.
 * Internet is not required.
 *
 * @returns An XRPL {@link Wallet}
 */
const generateWallet = () => {
  const wallet = Wallet.generate(ECDSA.secp256k1) // default curve secp256k1

  // also available, generate a wallet from an existing seed
  //   const wallet = Wallet.fromSeed('s...')

  console.log(wallet)

  return wallet
}

const main = async () => {
  // https://xrpl.org/public-servers.html#public-servers
  const client = new Client("wss://s.altnet.rippletest.net:51233/")

  // important: always connect the client
  await client.connect()

  // generate a new wallet
  const newWallet = generateWallet()

  // fund this new wallet
  const response = await client.fundWallet(newWallet)

  // alternatively, create a new wallet and fund it
  //   const response = await client.fundWallet()

  console.log(JSON.stringify(response, null, 2))

  await client.disconnect()
}

main()
