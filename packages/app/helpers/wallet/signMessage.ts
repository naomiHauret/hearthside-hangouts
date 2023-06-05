import type { providers } from "ethers";

/**
 * Signs a message using the specified signer and returns the signature and address
 * @param {Object} args - The arguments object
 * @param {providers.JsonRpcSigner} args.signer - a JsonRpcSigner instance from `ethers` (v5)
 * @param {string} args.message - The message to be signed
 *  @returns {Promise<{ signature: string, address: string }>} - A promise that resolves to an object containing the signature and address.
*/
export async function signMessage (args: {signer: providers.JsonRpcSigner,  message: string}): Promise<{ signature: string, address: string}>{
  const signature = await args.signer.signMessage(args.message);
  const address = await args.signer.getAddress();
  return {
    signature,
    address,
  };
};
  