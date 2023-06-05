import { utils } from 'ethers'
/**
 * Verify that a message was signed by the provided address
 * @param {Object} args - The arguments object.
 * @param {string} args.message - The message to be verified.
 * @param {string} args.address - The address associated with the signature.
 * @param {string} args.signature - The signature to be verified.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the message was signed by this address.
 */
export async function verifyMessage (args: { message: string, address: string, signature: string }): Promise<boolean>  {
  const signerAddr = await utils.verifyMessage(args.message, args.signature);
  if (signerAddr !== args.address) return false;  
  return true;
}