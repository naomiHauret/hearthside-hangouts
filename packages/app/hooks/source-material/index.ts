import type { CollectionList, CollectionRecordResponse, Polybase } from '@polybase/client'
import type { providers } from 'ethers'
import type { FileToUpload } from '../upload-file'
import type { FormValues } from '../../features/account/Form'
import { UseMutationResult, UseQueryResult, useQueryClient } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import { signMessage } from 'app/helpers'
import { useMagicWallet } from 'app/provider'
import { isAddress } from 'ethers/lib/utils'
import { usePolybase } from '../../provider/polybase'
import useCurrentUser from '../current-user'

export interface SourceMaterial {
  id: string
  title: string
  description: string
  authors: Array<string>
  format: string
  type: string
  thumbnailURI?: string
  language?: string
  genres?: string[]
  yearPublished?: string
  maturityRating?: string
}

export function useSourceMaterial(args: {
  id?: string
  shouldFetchMaterial?: boolean
  onQuerySourceMaterialSuccess?: any
}) {
  const queryClient = useQueryClient()
  const polybaseDb = usePolybase((s) => s.db) as Polybase
  const walletClient = useMagicWallet((s) => s.walletClient)
  const { userInfo } = useCurrentUser()

  const querySourceMaterial = useQuery({
    enabled:
      !args?.id || args?.id?.length === 0 || args?.shouldFetchMaterial !== true ? false : true,
    queryKey: ['source-material', args?.id],
    onSuccess(data) {
      if (data?.data === null) args?.onQuerySourceMaterialSuccess()
    },
    queryFn: async () => {
      const collectionReference = polybaseDb.collection('SourceMaterial')
      const record = await collectionReference.record(`${args?.id}`).get()
      return record
    },
    select(data) {
      if (data?.data) return data?.data
      return data
    },
  })
  const mutationCreateSourceMaterial = useMutation(
    async (values: {
      id: string
      title: string
      description: string
      authors: Array<string>
      format: string
      thumbnailURI: string
      language: string
      genres: Array<string>
      yearPublished: string
      maturityRating: string
    }) => {
      // Grab the signer
      const signer = (await walletClient?.getSigner(
        userInfo?.publicAddress as string
      )) as providers.JsonRpcSigner

      // Add it to our polybase instance
      // tried to assign in to the polybase instance in the sign in hook but it looks like we have to add it everywhere we need a signature
      // Not very elegant but we have to !
      polybaseDb.signer(async (data: string) => {
        const sig = await signMessage({
          signer,
          message: data,
        })
        return { h: 'eth-personal-sign', sig: sig.signature }
      })
      const collectionReference = polybaseDb.collection('SourceMaterial')
      //     constructor( id: string, title: string, description: string, authors: string[], format: string, type: string, thumbnailURI?: string, language?: string, genres?: string[], yearPublished?: string,  maturityRating?: string) {

      return await collectionReference.create([
        values.id,
        values.title,
        values.description,
        values.authors,
        values.format,
        'book',
        values.thumbnailURI,
        values.language,
        values.genres,
        values.yearPublished,
        values.maturityRating,
      ])
    }
  )

  return {
    mutationCreateSourceMaterial,
    querySourceMaterial,
  }
}
