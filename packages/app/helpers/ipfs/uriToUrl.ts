/**
 * Converts a CID (Content Identifier) to a URL using the web3.storage IPFS HTTP gateway
 * @param {string} cid - The CID to convert to a URL.
 * @returns {string} The URL generated from the CID using the web3.storage
 */
export function uriToUrl(cid: string) {
  return `https://${cid}.ipfs.w3s.link`
}
