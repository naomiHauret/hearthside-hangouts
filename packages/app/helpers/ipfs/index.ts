import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'

/**
 * Retrieves an Elastic IPFS client instance (powered by Web3.Storage)
 *
 * @param {string} token - Web3.Storage access token token.
 * @returns {Web3Storage} An (Elastic) IPFS client instance
 */
export function getIpfsClient (token: string) {
  return new Web3Storage({ token })
}

export default getIpfsClient