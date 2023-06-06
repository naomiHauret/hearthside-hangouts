import { providers } from 'ethers'
import type { Magic as MagicRNE } from '@magic-sdk/react-native-expo'

// @TODO: `getWalletClient(magic: MagicRNE)` `magic` should also have the type of `Magic` exported from magic-sdk
// like so: `function getWalletClient(magic: MagicRNE | MagicWeb)`

/**
 * Returns a `Web3Provider` instance using the specified Magic SDK instance (expo or web)
 * @returns {providers.Web3Provider} - The `Web3Provider` instance
 */
export function getWalletClient(magic: MagicRNE): providers.Web3Provider {
  return new providers.Web3Provider(magic.rpcProvider)
}
