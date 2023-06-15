import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { CollectionRecordResponse, Polybase } from '@polybase/client'
import type { providers } from 'ethers'
import type { FileToUpload } from '../upload-file'
import type { FormValues } from '../../features/clubs/Form'
import { useQueryClient } from '@tanstack/react-query'
import { useMutation, useQuery } from '@tanstack/react-query'
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
  creator: UserProfile
  creatorPublicKey: any
  coverURI: string
  openToNewMembers: boolean
  currentClubMaterial?: string
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
   * Query ; fetches club members from Polybase for a given <idClub>
   */
  const queryClubMembers = useQuery({
    queryKey: ['members', idClub],
    queryFn: async () => {
      const collectionReference = polybaseDb.collection('ClubMembership')
      const records = await collectionReference
        .where('club', '==', polybaseDb.collection('Club').record(idClub as string))
        .get()
      return {
        ...records,
        count: records?.data?.length + 1,
      }
    },

    enabled: !idClub || idClub === null || !polybaseDb ? false : true,
  })

  /**
   * Query get a list of given club materials for a specific club
   */
  const queryListClubMaterial = useQuery({
    queryKey: ['club-materials', idClub],
    queryFn: async () => {
      const collectionReference = polybaseDb.collection('ClubMaterial')
      const records = await collectionReference
        .where('club', '==', polybaseDb.collection('Club').record(idClub as string))
        .get()

      return records
    },
    select(data) {
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
        queryClient.invalidateQueries(['club', variables.idClub])
        queryClient.setQueryData(['club', variables.idClub], (oldData: any) => ({
          ...oldData,
          name: data.data.name,
          description: data.data.description,
          genres: data.data.genres,
          coverURI: data.data.coverURI,
        }))
        queryClient.invalidateQueries([
          'clubs-filtered',
          'creator',
          '==',
          polybaseDb.collection('UserProfile').record(userInfo?.publicAddress as string),
        ])

        mutationUploadCover.reset()
      },
    }
  )

  /**
   * Mutation ; creates a membership the current user in a given club on Polybase
   */
  const mutationJoinClub = useMutation(
    async function (values: { idClub: string }) {
      const currentUserEthAddress = userInfo?.publicAddress as string
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
      const collectionReference = polybaseDb.collection('ClubMembership')
      // constructor (id: string, club: Club, member: UserProfile)
      const id = `${currentUserEthAddress}/${values.idClub}`
      return await collectionReference.create([
        id,
        polybaseDb.collection('Club').record(values.idClub),
        polybaseDb.collection('UserProfile').record(currentUserEthAddress),
      ])
    },
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries([
          'membership',
          `${userInfo?.publicAddress}/${variables?.idClub}`,
        ])
        queryClient.invalidateQueries(['members', variables.idClub])
      },
    }
  )

  /**
   * Mutation ; destroys a given membership on Polybase
   */
  const mutationDestroyMembership = useMutation(
    async function (values: { idClub: string }) {
      const currentUserEthAddress = userInfo?.publicAddress as string
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
      const collectionReference = polybaseDb.collection('ClubMembership')
      return await collectionReference.record(values?.idClub).call('del', [])
    },
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries(['membership'])
        queryClient.invalidateQueries(['members'])
      },
    }
  )

  /**
   * Mutation ; set the current reading material
   */
  const mutationSetClubMaterial = useMutation(
    async function (values: { idClub: string; idClubMaterial: string }) {
      const currentUserEthAddress = userInfo?.publicAddress as string
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

      // we must call this function:  setCurrentMaterial (clubMaterial: ClubMaterial)
      const collectionReference = polybaseDb.collection('Club')
      return await collectionReference
        .record(values?.idClub as string)
        .call('setCurrentMaterial', [values.idClubMaterial])
    },
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries(['club', variables?.idClub])
      },
    }
  )
  return {
    queryClub,
    queryClubMembers,
    queryClubs,
    queryListClubMaterial,
    mutationCreateClub,
    mutationUpdateClub,
    mutationJoinClub,
    mutationDestroyMembership,
    mutationSetClubMaterial,
  }
}

export default useClubs
