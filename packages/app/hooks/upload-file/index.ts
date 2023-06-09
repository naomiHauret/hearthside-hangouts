import type { UseMutationResult } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { useIPFS } from 'app/provider'

export interface FileToUpload {
  uri: string
  mimeType: string
  name: string
}

const ENDPOINT = 'https://api.web3.storage'
/**
 *
 * Custom hook for uploading a file to IPFS (using Web3.Storage API as our IPFS client under the hood)
 */
export function useUploadFile(): {
  uploadFile: (args: FileToUpload) => Promise<string>
  mutationUploadFile: UseMutationResult<string, unknown, FileToUpload, unknown>
} {
  const accessToken = useIPFS((s) => s.web3StorageAccessToken)

  /**
   * Uploads a file to IPFS using Web3 Storage API under the hood
   *
   * @param {FileToUpload} args - The file to upload, represented as `{URI, mimeType, name}`.
   * @returns {Promise<string>} A promise that resolves to the CID (Content Identifier) of the uploaded file.
   */
  async function uploadFile(args: { name: string; mimeType: string; uri: string }) {
    const { name, mimeType, uri } = args
    const data = new FormData()
    data.append('file', {
      //@ts-ignore
      name,
      type: mimeType,
      uri: uri,
    })
    const response = await fetch(`${ENDPOINT}/upload`, {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const result: { carCid: string; cid: string } = await response.json()

    return result.cid
  }

  /**
   * Mutation that uploads a file to IPFS ;
   * @link uploadFile
   */
  const mutationUploadFile = useMutation(uploadFile)
  return {
    mutationUploadFile,
    uploadFile,
  }
}
