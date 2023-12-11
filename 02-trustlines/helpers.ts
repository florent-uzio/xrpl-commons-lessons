import { TxResponse, convertStringToHex } from "xrpl"

/**
 * Helper to convert the token name to the correct hexadecimal.
 * https://xrpl.org/currency-formats.html#currency-codes
 *
 * @param {string} tokenName The token name.
 * @returns The token name or the hexadecimal version of it for the XRPL.
 */
export const convertCurrencyCode = (tokenName: string) => {
  if (tokenName.length <= 3) return tokenName

  return convertStringToHex(tokenName).toUpperCase().padEnd(40, "0")
}

export const isTxnSuccessful = (result: TxResponse) => {
  const { meta } = result.result

  if (typeof meta === "string" || !meta) return false
  return meta.TransactionResult === "tesSUCCESS"
}
