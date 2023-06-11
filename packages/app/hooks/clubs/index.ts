import type { CollectionRecordResponse, Polybase } from '@polybase/client'
import type { providers } from 'ethers'
import type { FileToUpload } from '../upload-file'
import type { FormValues } from '../../features/clubs/create/Form'
import { UseMutationResult, UseQueryResult, useQueryClient } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
import { v4 as uuidv4 } from 'uuid'
import { signMessage } from 'app/helpers'
import { useMagicWallet } from 'app/provider'
import { usePolybase } from '../../provider/polybase'
import { useUploadFile } from '../upload-file'
import { UserProfile } from '../profile-user'
import useCurrentUser from '../current-user'
/**
 * Represents the base data of a club
 */
export interface ClubBaseData {
  coverURI: string
  description: string
  name: string
  id: string // the id of the club
  genres: Array<string>
}

/**
 * Club as returned from Polybase (includes the creator public key)
 */
export interface Club extends ClubBaseData {
  publicKey: Object
  membersList: Map<any, UserProfile>
  membersCount: number
  creator: UserProfile
  creatorPublicKey: any
  coverURI: string
  openToNewMembers: boolean
  materialList: Array<any>
}

/**
 * Custom hook for creating, updating and reading clubs data stored on Polybase.
 *
 * @param {string|null} idClub - the id of the club to get data from.
 */
export function useClubs(idClub?: string | null) {
  const queryClient = useQueryClient()
  const polybaseDb = usePolybase((s) => s.db) as Polybase
  const walletClient = useMagicWallet((s) => s.walletClient)
  const { userInfo } = useCurrentUser()
  const { uploadFile } = useUploadFile()

  /**
   * Ensures that the proper URI of the cover image is returned.
   * @async
   * @param {Object} args - The arguments for handling the cover.
   * @param {string} args.originalURI - The original URI of the cover.
   * @param {FileToUpload | null} args.fileToUpload - The file to upload as the new cover.
   * @returns {Promise<string>} A promise that resolves to the cover URI, either the CID of the newly uploaded cover or the unchanged original URI.
   */
  async function handleCover(args: { originalURI: string; fileToUpload?: FileToUpload | null }) {
    let avatarURI = args?.originalURI
    let fileToUpload = args?.fileToUpload

    if (fileToUpload?.uri && !mutationUploadCover.isSuccess) {
      avatarURI = await mutationUploadCover.mutateAsync(fileToUpload)
    }
    return avatarURI
  }

  /**
   * Mutation ; upload the cover file to IPFS
   */
  const mutationUploadCover = useMutation(async (fileToUpload: FileToUpload) => {
    const cid = await uploadFile({ ...fileToUpload })
    return cid
  })

  /**
   * Query ; fetches a club data from Polybase for a given <idClub>
   */
  const queryClub = useQuery({
    queryKey: ['club', idClub],
    queryFn: async () => {
      const collectionReference = polybaseDb.collection('Club')
      const record = await collectionReference.record(`${idClub}`).get()
      return record
    },
    select(data): undefined | Club {
      if (data?.data !== null) {
        return data?.data
      }
    },
    enabled: !idClub || idClub === null || !polybaseDb ? false : true,
  })

  /**
   * Query ; fetches clubs data from Polybase
   */
  const queryClubs = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const collectionReference = polybaseDb.collection('Club')
      const records = await collectionReference.get()
      return records
    },
  })

  /**
   * Mutation ; creates a user profile on Polybase
   */
  const mutationCreateClub = useMutation(
    async function (values: FormValues): Promise<CollectionRecordResponse<any, Club>> {
      const currentUserEthAddress = userInfo?.publicAddress as string
      const coverURI = await handleCover({
        originalURI: values?.coverURI,
        fileToUpload: values?.coverFile,
      })
      // Grab the signer
      const signer = (await walletClient?.getSigner(
        currentUserEthAddress
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
      const collectionReference = polybaseDb.collection('Club')
      //const userProfile = await polybaseDb.collection('UserProfile').record(currentUserEthAddress).get()

      // constructor (id: string, name: string, description: string, genres: string[], creator: UserProfile, coverURI: string, openToNewMembers: boolean ) {

      return await collectionReference.create([
        values?.idClub as string,
        values.name,
        values.description,
        values.genres,
        polybaseDb.collection('UserProfile').record(currentUserEthAddress),
        coverURI,
        true, //@todo: make this a variable
      ])
    },
    {
      onSuccess(data) {
        queryClient.invalidateQueries([
          'clubs-filtered',
          'creator',
          '==',
          polybaseDb.collection('UserProfile').record(userInfo?.publicAddress as string),
        ])
        queryClient.invalidateQueries(['clubs'])
        mutationUploadCover.reset()
      },
    }
  )

  /**
   * Mutation ; updates a club on Polybase fetches for a given <id> (our id here is a ethereum address)
   */
  const mutationUpdateClub = useMutation(
    async function (values: FormValues) {
      const currentUserEthAddress = userInfo?.publicAddress as string
      const coverURI = await handleCover({
        originalURI: values?.coverURI,
        fileToUpload: values?.coverFile,
      })
      // Grab the signer
      const signer = (await walletClient?.getSigner(
        currentUserEthAddress
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
      const collectionReference = polybaseDb.collection('Club')
      // updateClubInfo(name: string, description: string, genres: string[],  coverURI: string, openToNewMembers: boolean)
      return await collectionReference
        .record(values?.idClub as string)
        .call('updateClubInfo', [values.name, values.description, values.genres, coverURI, true])
    },
    {
      onSuccess(data, variables, context) {
        queryClient.setQueryData(['club', variables.idClub], (oldData: any) => ({
          ...oldData,
          name: data.data.name,
          description: data.data.description,
          genres: data.data.genres,
          coverURI: data.data.coverURI,
        }))

        mutationUploadCover.reset()
      },
    }
  )
  return {
    queryClub,
    queryClubs,
    mutationCreateClub,
    mutationUpdateClub,
  }
}

export default useClubs
