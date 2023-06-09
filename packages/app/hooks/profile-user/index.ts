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
import { useUploadFile } from '../upload-file'
/**
 * Represents the base data of a user profile
 */
export interface UserProfileBaseData {
  avatarURI: string
  bio: string
  displayName: string
  id: string // this is actually the ethereum address of the user
  publicAddress: string // NOT THE ETHEREUM ADDRESS ! this is the public key but as a string
}

/**
 * User profile as returned from Polybase (includes the creator public key)
 */
export interface UserProfile extends UserProfileBaseData {
  publicKey: Object
}

/**
 * Custom hook for creating, updating and reading user profiles data stored on Polybase.
 *
 * @param {string|null} userEthereumAddress - The Ethereum address to get profile data for.
 */
export function useUserProfile(args: {
  userEthereumAddress?: string | null
  shouldFetchProfile?: boolean
  shouldFetchMemberships?: boolean
}): {
  queryUserProfile: UseQueryResult<UserProfile | undefined, unknown>
  queryUserClubMemberships: UseQueryResult<CollectionList<any>, unknown>
  mutationCreateUserProfile: UseMutationResult<
    CollectionRecordResponse<any, any>,
    unknown,
    {
      publicEthAddress: string
      displayName: string
      bio: string
      avatarURI: string
    },
    unknown
  >
  mutationUpdateUserProfile: UseMutationResult<
    CollectionRecordResponse<any, any>,
    unknown,
    {
      publicEthAddress: string
      displayName: string
      bio: string
      avatarURI: string
    },
    unknown
  >
} {
  const queryClient = useQueryClient()
  const polybaseDb = usePolybase((s) => s.db) as Polybase
  const walletClient = useMagicWallet((s) => s.walletClient)
  const { uploadFile } = useUploadFile()

  /**
   * Ensures that the proper URI of the avatar image is returned.
   * @async
   * @param {Object} args - The arguments for handling the avatar.
   * @param {string} args.originalURI - The original URI of the avatar.
   * @param {FileToUpload | null} args.fileToUpload - The file to upload as the new avatar.
   * @returns {Promise<string>} A promise that resolves to the avatar URI, either the CID of the newly uploaded avatar or the unchanged original URI.
   */
  async function handleAvatar(args: { originalURI: string; fileToUpload?: FileToUpload | null }) {
    let avatarURI = args?.originalURI
    let fileToUpload = args?.fileToUpload

    if (fileToUpload?.uri && !mutationUploadAvatar.isSuccess) {
      avatarURI = await mutationUploadAvatar.mutateAsync(fileToUpload)
    }
    return avatarURI
  }

  /**
   * Mutation ; upload the avatar file to IPFS
   */
  const mutationUploadAvatar = useMutation(async (fileToUpload: FileToUpload) => {
    const cid = await uploadFile({ ...fileToUpload })
    return cid
  })

  /**
   * Query ; fetches a user profile data from Polybase for a given <id> (our id here is a ethereum address)
   */
  const queryUserProfile = useQuery({
    queryKey: ['profile', args?.userEthereumAddress],
    queryFn: async () => {
      const collectionReference = polybaseDb.collection('UserProfile')
      const record = await collectionReference.record(`${args?.userEthereumAddress}`).get()
      return record
    },
    select(data): undefined | UserProfile {
      if (data?.data !== null) {
        return data?.data
      }
    },
    enabled:
      !isAddress(`${args?.userEthereumAddress}`) || args?.shouldFetchProfile !== true || !polybaseDb
        ? false
        : true,
  })

  /**
   * Query ; fetches list of club memberships for a given user from Polybase
   */
  const queryUserClubMemberships = useQuery({
    queryKey: ['memberships', args?.userEthereumAddress],
    queryFn: async () => {
      const collectionReference = polybaseDb.collection('ClubMembership')
      const records = await collectionReference
        .where(
          'member',
          '==',
          polybaseDb.collection('UserProfile').record(args?.userEthereumAddress as string)
        )
        .get()
      return records
    },
    enabled:
      !isAddress(`${args?.userEthereumAddress}`) ||
      !polybaseDb ||
      args?.shouldFetchMemberships !== true
        ? false
        : true,
  })

  /**
   * Mutation ; creates a user profile on Polybase
   */
  const mutationCreateUserProfile = useMutation(
    async function (values: FormValues): Promise<CollectionRecordResponse<any, UserProfile>> {
      const avatarURI = await handleAvatar({
        originalURI: values?.avatarURI,
        fileToUpload: values?.avatarFile,
      })
      // Grab the signer
      const signer = (await walletClient?.getSigner(
        values.publicEthAddress
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
      const collectionReference = polybaseDb.collection('UserProfile')
      // Constructor: publicEthAddress: string, displayName: string, bio: string, avatarURI: string
      return await collectionReference.create([
        values.publicEthAddress,
        values.displayName,
        values.bio,
        avatarURI,
      ])
    },
    {
      onSuccess(data, variables, context) {
        queryClient.setQueryData(['profile', variables.publicEthAddress], (oldData: any) => ({
          ...oldData,
          displayName: data.data.displayName,
          bio: data.data.bio,
          avatarURI: data.data.avatarURI,
        }))
        queryClient.invalidateQueries(['profile', variables.publicEthAddress])

        mutationUploadAvatar.reset()
      },
    }
  )

  /**
   * Mutation ; updates a user profile on Polybase fetches for a given <id> (our id here is a ethereum address)
   */
  const mutationUpdateUserProfile = useMutation(
    async function (values: FormValues) {
      const avatarURI = await handleAvatar({
        originalURI: values?.avatarURI,
        fileToUpload: values?.avatarFile,
      })
      // Grab the signer
      const signer = (await walletClient?.getSigner(
        values.publicEthAddress
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
      const collectionReference = polybaseDb.collection('UserProfile')
      // updateProfile(displayName: string, bio: string, avatarURI: string)
      return await collectionReference
        .record(values.publicEthAddress)
        .call('updateProfile', [values.displayName, values.bio, avatarURI])
    },
    {
      onSuccess(data, variables, context) {
        queryClient.invalidateQueries(['profile', variables.publicEthAddress])
        queryClient.setQueryData(['profile', variables.publicEthAddress], (oldData: any) => ({
          ...oldData,
          displayName: data.data.displayName,
          bio: data.data.bio,
          avatarURI: data.data.avatarURI,
        }))
        mutationUploadAvatar.reset()
      },
    }
  )
  return {
    queryUserClubMemberships,
    queryUserProfile,
    mutationCreateUserProfile,
    mutationUpdateUserProfile,
  }
}

export default useUserProfile
